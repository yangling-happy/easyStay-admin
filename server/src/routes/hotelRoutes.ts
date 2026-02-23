import express from "express";
import type { Request } from "express";
import type { Response } from "express";
import { HotelModel } from "../models/Hotel.js";
import { NotificationModel } from "../models/Notification.js";
import { auth } from "../middleware/authMiddleware.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

const router = express.Router();

router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotelData = {
      ...req.body,
      ownerId: req.user?.userId,
      status: "pending",
      createTime: new Date(),
      updateTime: new Date(),
      auditHistory: [
        {
          action: "create",
          status: "pending",
          operatorId: req.user?.userId,
          operatorRole: "merchant",
          timestamp: new Date(),
        },
      ],
    };

    const hotel = new HotelModel(hotelData);
    const savedHotel = await hotel.save();

    res.status(201).json({ success: true, data: savedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get("/records", auth, async (req: AuthRequest, res: Response) => {
  try {
    const query = {
      ownerId: req.user?.userId,
      isDeleted: false,
    };

    const hotels = await HotelModel.find(query).sort({ updateTime: -1 });

    res.json({ success: true, data: hotels });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
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

    const beforeStatus = hotel.isActive;
    const afterStatus = false;

    const snapshot = hotel.toObject();
    const snapshotWithoutId = { ...snapshot };
    delete (snapshotWithoutId as any)._id;
    delete (snapshotWithoutId as any).__v;
    delete (snapshotWithoutId as any).auditHistory;

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        isActive: false,
        updateTime: new Date(),
        $push: {
          auditHistory: {
            action: "offline",
            status: hotel.status,
            operatorId: req.user?.userId,
            operatorRole: "merchant",
            timestamp: new Date(),
            beforeStatus,
            afterStatus,
            snapshot: snapshotWithoutId,
          },
        },
      },
      { new: true },
    );

    if (updatedHotel) {
      try {
        if (updatedHotel.ownerId) {
          const ownerIdStr = String(updatedHotel.ownerId);
          const message = `您的酒店"${updatedHotel.name}"已由您本人下线`;
          await NotificationModel.create({
            type: "hotel_offline",
            hotelId: String(req.params.id),
            hotelName: updatedHotel.name,
            ownerId: ownerIdStr,
            status: "unread",
            message,
            operatorId: req.user?.userId,
            operatorRole: "merchant",
          });
          console.log(`已为商户创建下线通知:`, {
            ownerId: ownerIdStr,
            hotelName: updatedHotel.name,
            message,
          });
        }
      } catch (notificationError: any) {
        console.error("创建下线通知失败:", {
          error: notificationError.message,
          ownerId: updatedHotel.ownerId,
          hotelId: req.params.id,
        });
      }
    }

    res.json({ success: true, message: "酒店已成功下线", data: updatedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
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

    if (hotel.status !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "只有审核通过的酒店才能直接上线" });
    }

    const beforeStatus = hotel.isActive;
    const afterStatus = true;

    const snapshot = hotel.toObject();
    const snapshotWithoutId = { ...snapshot };
    delete (snapshotWithoutId as any)._id;
    delete (snapshotWithoutId as any).__v;
    delete (snapshotWithoutId as any).auditHistory;

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        isActive: true,
        updateTime: new Date(),
        $push: {
          auditHistory: {
            action: "online",
            status: hotel.status,
            operatorId: req.user?.userId,
            operatorRole: "merchant",
            timestamp: new Date(),
            beforeStatus,
            afterStatus,
            snapshot: snapshotWithoutId,
          },
        },
      },
      { new: true },
    );

    if (updatedHotel) {
      try {
        if (updatedHotel.ownerId) {
          const ownerIdStr = String(updatedHotel.ownerId);
          const message = `您的酒店"${updatedHotel.name}"已由您本人上线`;
          await NotificationModel.create({
            type: "hotel_online",
            hotelId: String(req.params.id),
            hotelName: updatedHotel.name,
            ownerId: ownerIdStr,
            status: "unread",
            message,
            operatorId: req.user?.userId,
            operatorRole: "merchant",
          });
          console.log(`已为商户创建上线通知:`, {
            ownerId: ownerIdStr,
            hotelName: updatedHotel.name,
            message,
          });
        }
      } catch (notificationError: any) {
        console.error("创建上线通知失败:", {
          error: notificationError.message,
          ownerId: updatedHotel.ownerId,
          hotelId: req.params.id,
        });
      }
    }

    res.json({ success: true, message: "酒店已成功上线", data: updatedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
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

    const snapshot = hotel.toObject();
    const snapshotWithoutId = { ...snapshot };
    delete (snapshotWithoutId as any)._id;
    delete (snapshotWithoutId as any).__v;
    delete (snapshotWithoutId as any).auditHistory;

    const beforeStatus = hotel.status;
    const afterStatus = "pending";

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        status: "pending",
        isActive: false,
        rejectReason: "",
        updateTime: new Date(),
        $push: {
          auditHistory: {
            action: "reapply_online",
            status: "pending",
            operatorId: req.user?.userId,
            operatorRole: "merchant",
            timestamp: new Date(),
            beforeStatus,
            afterStatus,
            snapshot: snapshotWithoutId,
          },
        },
      },
      { new: true },
    );

    if (!updatedHotel) {
      return res.status(404).json({ success: false, message: "更新酒店失败" });
    }

    res.json({
      success: true,
      message: "已提交重新上线申请",
      data: updatedHotel,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("提交重新上线申请失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.put("/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { version, ...updateData } = req.body;

    if (updateData.id && updateData.id !== id) {
      return res.status(400).json({
        success: false,
        message: "不允许修改酒店 ID",
      });
    }

    const existingHotel = await HotelModel.findOne({
      _id: id,
      ownerId: req.user?.userId,
    });

    if (!existingHotel) {
      return res.status(404).json({
        success: false,
        message: "未找到酒店或无权修改",
      });
    }

    if (version !== undefined && existingHotel.version !== version) {
      return res.status(409).json({
        success: false,
        message: "数据已被其他用户修改，请刷新后重试",
        currentVersion: existingHotel.version,
      });
    }

    const isIdentical = Object.keys(updateData).every((key) => {
      if (
        [
          "_id",
          "__v",
          "createTime",
          "updateTime",
          "version",
          "auditHistory",
        ].includes(key)
      ) {
        return true;
      }
      return (
        JSON.stringify(updateData[key]) ===
        JSON.stringify((existingHotel as any)[key])
      );
    });

    if (isIdentical) {
      return res.json({
        success: true,
        data: existingHotel,
        message: "数据未发生变化",
      });
    }

    const snapshot = existingHotel.toObject();
    const snapshotWithoutId = { ...snapshot };
    delete (snapshotWithoutId as any)._id;
    delete (snapshotWithoutId as any).__v;
    delete (snapshotWithoutId as any).auditHistory;

    const finalUpdateData: any = {
      ...updateData,
      ownerId: req.user?.userId,
      status: "pending",
      rejectReason: "",
      updateTime: new Date(),
      version: existingHotel.version + 1,
      $push: {
        auditHistory: {
          action: "update",
          status: "pending",
          operatorId: req.user?.userId,
          operatorRole: "merchant",
          timestamp: new Date(),
          snapshot: snapshotWithoutId,
        },
      },
    };

    const updatedHotel = await HotelModel.findOneAndUpdate(
      {
        _id: id,
        ownerId: req.user?.userId,
        ...(version !== undefined ? { version } : {}),
      },
      finalUpdateData,
      { new: true },
    );

    if (!updatedHotel) {
      return res.status(409).json({
        success: false,
        message: "数据已被其他用户修改，请刷新后重试",
      });
    }

    res.json({
      success: true,
      data: updatedHotel,
      message: "酒店信息已更新，等待审核",
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("更新酒店失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get("/detail/:id", async (req: Request, res: Response) => {
  try {
    const hotel = await HotelModel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    const publicHotelData = {
      id: hotel._id.toString(),
      name: hotel.name,
      nameEn: hotel.nameEn,
      address: hotel.address,
      star: hotel.star,
      openingDate: hotel.openingDate,
      photos: hotel.photos,
      amenities: hotel.amenities,
      roomTypes: hotel.roomTypes,
      status: hotel.status,
      isActive: hotel.isActive,
    };

    res.json({ success: true, data: publicHotelData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// 获取指定商户的酒店列表
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    // 只查对应的 ownerId，并且只返回 name 和 _id 提高效率
    const hotels = await HotelModel.find({ ownerId }, "name _id");
    res.json({ success: true, data: hotels });
  } catch (error) {
    res.status(500).json({ success: false, message: "获取酒店失败" });
  }
});

export default router;
