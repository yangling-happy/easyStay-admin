import express from "express";
import type { Request } from "express";
import type { Response } from "express";
import { HotelModel } from "../models/Hotel.js";
import { NotificationModel } from "../models/Notification.js";
import { User } from "../models/User.js";
import { auth } from "../middleware/authMiddleware.js";

async function notifyAdminsOfPendingHotel(hotelId: string, hotelName: string) {
  try {
    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length === 0) return;
    const message = `有新的酒店"${hotelName}"待审核`;
    await NotificationModel.insertMany(
      admins.map((a) => ({
        type: "pending_audit",
        hotelId,
        hotelName,
        ownerId: a._id.toString(),
        status: "unread",
        message,
      })),
    );
  } catch (e: unknown) {
    console.error("通知管理员待审核失败:", e);
  }
}

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

const router = express.Router();

router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const isIncomplete =
      req.body?.isIncomplete === true ||
      ["draft", "incomplete", "rejected"].includes(req.body?.completionStatus);

    const completionStatus = isIncomplete
      ? req.body?.completionStatus || "draft"
      : null;

    const hotelData = {
      ...req.body,
      ownerId: req.user?.userId,
      status: "pending",
      isIncomplete,
      completionStatus,
      isActive: isIncomplete ? false : (req.body?.isActive ?? false),
      createTime: new Date(),
      updateTime: new Date(),
      auditHistory: [
        {
          action: "create",
          status: "pending",
          operatorId: req.user?.userId,
          operatorRole: "merchant",
          timestamp: new Date(),
          beforeStatus: null,
          afterStatus: {
            status: "pending",
            isIncomplete,
            completionStatus,
          },
        },
      ],
    };

    const hotel = new HotelModel(hotelData);
    const savedHotel = await hotel.save();

    if (!isIncomplete) {
      await notifyAdminsOfPendingHotel(String(savedHotel._id), savedHotel.name);
    }

    console.log("酒店保存成功:", {
      id: savedHotel._id,
      name: savedHotel.name,
      isIncomplete: savedHotel.isIncomplete,
      completionStatus: savedHotel.completionStatus,
      status: savedHotel.status,
    });

    res.status(201).json({ success: true, data: savedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("保存酒店失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get("/records", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { scope } = req.query as { scope?: string };
    const query: any = {
      ownerId: req.user?.userId,
      isDeleted: false,
    };

    if (scope === "audit") {
      // 包括所有需要显示在管理面板中的状态：待审核、已批准、已拒绝、已下线
      query.status = { $in: ["pending", "approved", "rejected", "offline"] };
    }

    const hotels = await HotelModel.find(query).sort({ createTime: -1 });
    res.json({ success: true, data: hotels });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("获取酒店记录失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get("/owner/:ownerId", async (req: AuthRequest, res: Response) => {
  try {
    const { ownerId } = req.params;

    // 获取所有可用于关联反馈的酒店：处于审核中、已批准、已下线、已拒绝状态
    const hotels = await HotelModel.find({
      ownerId,
      isDeleted: false,
      isIncomplete: false,
      status: { $in: ["pending", "approved", "rejected", "offline"] },
    }).select("_id name");

    res.json({ success: true, data: hotels });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("获取所有者酒店失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get("/detail/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    res.json({ success: true, data: hotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("获取酒店详情失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.put("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    const currentVersion = hotel.version || 0;
    const newVersion = req.body.version || 0;

    if (newVersion !== currentVersion) {
      return res
        .status(409)
        .json({ success: false, message: "数据已被更新，请刷新页面后重试" });
    }

    const isIncomplete =
      req.body?.isIncomplete === true ||
      ["draft", "incomplete", "rejected"].includes(req.body?.completionStatus);

    const completionStatus = isIncomplete
      ? req.body?.completionStatus || "draft"
      : null;

    const { ownerId: _ownerId, ...restBody } = req.body || {};

    const updateData: any = {
      ...restBody,
      ownerId: hotel.ownerId,
      updateTime: new Date(),
      version: (currentVersion || 0) + 1,
    };

    if (isIncomplete) {
      updateData.isIncomplete = true;
      updateData.completionStatus = completionStatus;
      updateData.isActive = false;
    } else {
      updateData.isIncomplete = false;
      updateData.completionStatus = null;
    }

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      updateData,
      { new: true },
    );

    if (!updatedHotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    const auditEntry = {
      action: "update",
      status: updatedHotel.status,
      operatorId: req.user?.userId,
      operatorRole: req.user?.role || "merchant",
      timestamp: new Date(),
      beforeStatus: {
        status: hotel.status,
        isIncomplete: hotel.isIncomplete,
        completionStatus: hotel.completionStatus,
      },
      afterStatus: {
        status: updatedHotel.status,
        isIncomplete: updatedHotel.isIncomplete,
        completionStatus: updatedHotel.completionStatus,
      },
    };

    await HotelModel.updateOne(
      { _id: req.params.id },
      { $push: { auditHistory: auditEntry } },
    );

    console.log("酒店更新成功:", {
      id: updatedHotel._id,
      name: updatedHotel.name,
      isIncomplete: updatedHotel.isIncomplete,
      completionStatus: updatedHotel.completionStatus,
      status: updatedHotel.status,
    });

    res.json({ success: true, data: updatedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("更新酒店失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.patch("/:id/offline", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    if (hotel.status !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "只能下线已上线的酒店" });
    }

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        isActive: false,
        status: "offline",
        updateTime: new Date(),
      },
      { new: true },
    );

    // 发送通知给商户：酒店已下线
    try {
      const message = `您的酒店"${hotel.name}"已下线，旅客将无法预订。如需恢复上线，请在酒店列表中提交申请。`;
      await NotificationModel.create({
        type: "hotel_offline",
        hotelId: hotel._id.toString(),
        hotelName: hotel.name,
        ownerId: hotel.ownerId ? hotel.ownerId.toString() : "",
        status: "unread",
        message,
      });
    } catch (notifyError) {
      console.error("发送下线通知失败:", notifyError);
    }

    const auditEntry = {
      action: "offline",
      status: "offline",
      operatorId: req.user?.userId,
      operatorRole: req.user?.role || "merchant",
      timestamp: new Date(),
      beforeStatus: {
        status: hotel.status,
        isActive: hotel.isActive,
      },
      afterStatus: {
        status: "offline",
        isActive: false,
      },
    };

    await HotelModel.updateOne(
      { _id: req.params.id },
      { $push: { auditHistory: auditEntry } },
    );

    res.json({ success: true, data: updatedHotel, message: "酒店已下线" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("下线酒店失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.patch("/:id/online", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    if (hotel.status !== "offline" && hotel.status !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "只能上线已下线或已上线的酒店" });
    }

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        isActive: true,
        status: "pending",
        updateTime: new Date(),
      },
      { new: true },
    );

    if (!updatedHotel) {
      return res.status(404).json({ success: false, message: "更新酒店失败" });
    }

    await notifyAdminsOfPendingHotel(
      String(updatedHotel._id),
      updatedHotel.name,
    );

    const auditEntry = {
      action: "online",
      status: "pending",
      operatorId: req.user?.userId,
      operatorRole: req.user?.role || "merchant",
      timestamp: new Date(),
      beforeStatus: {
        status: hotel.status,
        isActive: hotel.isActive,
      },
      afterStatus: {
        status: "pending",
        isActive: true,
      },
    };

    await HotelModel.updateOne(
      { _id: req.params.id },
      { $push: { auditHistory: auditEntry } },
    );

    res.json({ success: true, data: updatedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("上线酒店失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.post("/:id/re-apply", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    // 支持 rejected 和 offline 两种状态的重新申请/恢复上线
    if (hotel.status !== "rejected" && hotel.status !== "offline") {
      return res.status(400).json({
        success: false,
        message: "只能重新申请已拒绝的酒店或恢复已下线的酒店上线",
      });
    }

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        status: "pending",
        isActive: false,
        updateTime: new Date(),
      },
      { new: true },
    );

    if (!updatedHotel) {
      return res.status(404).json({ success: false, message: "更新酒店失败" });
    }

    await notifyAdminsOfPendingHotel(
      String(updatedHotel._id),
      updatedHotel.name,
    );

    const auditEntry = {
      action: "re-apply",
      status: "pending",
      operatorId: req.user?.userId,
      operatorRole: req.user?.role || "merchant",
      timestamp: new Date(),
      beforeStatus: {
        status: hotel.status,
        isActive: hotel.isActive,
      },
      afterStatus: {
        status: "pending",
        isActive: false,
      },
    };

    await HotelModel.updateOne(
      { _id: req.params.id },
      { $push: { auditHistory: auditEntry } },
    );

    res.json({
      success: true,
      data: updatedHotel,
      message: "申请已提交，请关注审核记录",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("申请恢复上线失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.post("/restore", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.body;

    const hotel = await HotelModel.findOne({
      _id: id,
      ownerId: req.user?.userId,
      isDeleted: true,
    });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "未找到已删除的酒店" });
    }

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: id, ownerId: req.user?.userId, isDeleted: true },
      {
        isDeleted: false,
        updateTime: new Date(),
      },
      { new: true },
    );

    if (!updatedHotel) {
      return res.status(404).json({ success: false, message: "恢复酒店失败" });
    }

    const auditEntry = {
      action: "restore",
      status: updatedHotel.status,
      operatorId: req.user?.userId,
      operatorRole: req.user?.role || "merchant",
      timestamp: new Date(),
      beforeStatus: {
        isDeleted: true,
      },
      afterStatus: {
        isDeleted: false,
      },
    };

    await HotelModel.updateOne(
      { _id: id },
      { $push: { auditHistory: auditEntry } },
    );

    res.json({ success: true, data: updatedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("恢复酒店失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.delete("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        isDeleted: true,
        updateTime: new Date(),
      },
    );

    res.json({ success: true, message: "酒店已删除" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.post("/batch-delete", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "请提供要删除的酒店ID列表" });
    }

    const query: any = {
      _id: { $in: ids },
      isDeleted: false,
    };

    if (req.user?.role !== "admin") {
      query.ownerId = req.user?.userId;
    }

    const hotels = await HotelModel.find(query);

    if (hotels.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "未找到可删除的酒店" });
    }

    let successCount = 0;
    let failedCount = 0;
    const failedIds: string[] = [];
    const deleteLogs: any[] = [];

    for (const hotel of hotels) {
      try {
        deleteLogs.push({
          hotelId: hotel._id,
          hotelName: hotel.name,
          ownerId: hotel.ownerId,
          beforeData: hotel.toObject(),
          operatorId: req.user?.userId,
          operatorRole: req.user?.role,
          deleteTime: new Date(),
        });

        await HotelModel.updateOne(
          { _id: hotel._id, ownerId: hotel.ownerId },
          {
            isDeleted: true,
            updateTime: new Date(),
          },
        );

        successCount++;
      } catch (error) {
        console.error(`删除酒店 ${hotel._id} 失败:`, error);
        failedCount++;
        failedIds.push(String(hotel._id));
      }
    }

    console.log("批量删除日志:", {
      totalCount: ids.length,
      successCount,
      failedCount,
      failedIds,
      deleteLogs,
    });

    res.json({
      success: true,
      message: `成功删除 ${successCount} 家酒店${failedCount > 0 ? `，失败 ${failedCount} 家` : ""}`,
      data: {
        successCount,
        failedCount,
        failedIds,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("批量删除失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;
