import express from "express";
import { HotelModel } from "../models/Hotel.js";
import { NotificationModel } from "../models/Notification.js";

const router = express.Router();

// GET /api/admin/hotels/pending - 获取待审核列表
router.get("/hotels/pending", async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: "pending",
      isDeleted: false,
    }).sort({ createTime: -1 });

    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取待审核列表失败:", error);
    res.status(500).json({
      message: "获取待审核列表失败",
      error,
    });
  }
});

// GET /api/admin/hotels/published - 获取已发布酒店列表
router.get("/hotels/published", async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: "approved",
      isDeleted: false,
      isActive: true,
    }).sort({ createTime: -1 });

    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取已发布酒店列表失败:", error);
    res.status(500).json({
      message: "获取已发布酒店列表失败",
      error,
    });
  }
});

// GET /api/admin/hotels/rejected - 获取已拒绝酒店列表
router.get("/hotels/rejected", async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: "rejected",
      isDeleted: false,
    }).sort({ createTime: -1 });

    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取已拒绝酒店列表失败:", error);
    res.status(500).json({
      message: "获取已拒绝酒店列表失败",
      error,
    });
  }
});

// GET /api/admin/hotels/offline - 获取已下线酒店列表
router.get("/hotels/offline", async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: "approved",
      isActive: false, // 使用 isActive: false 判断下线
      isDeleted: false,
    }).sort({ createTime: -1 });

    const hotelsWithId = hotels.map((hotel) => {
      const hotelObj = hotel.toObject();
      return {
        ...hotelObj,
        id: hotelObj._id.toString(),
        _id: undefined,
      };
    });

    res.json(hotelsWithId);
  } catch (error) {
    console.error("获取已下线酒店列表失败:", error);
    res.status(500).json({
      message: "获取已下线酒店列表失败",
      error,
    });
  }
});

// POST /api/admin/hotels/:id/audit - 提交审核结果
router.post("/hotels/:id/audit", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    console.log("🔍 [审核接口] 收到审核请求");
    console.log("🔍 酒店 ID:", id);
    console.log("🔍 审核状态:", status);
    console.log("🔍 拒绝原因:", rejectReason);

    if (!["approved", "rejected"].includes(status)) {
      console.log("❌ 无效的审核状态");
      return res.status(400).json({
        message: "无效的审核状态，只能是 approved 或 rejected",
      });
    }

    if (status === "rejected" && !rejectReason) {
      console.log("❌ 拒绝审核但未提供原因");
      return res.status(400).json({
        message: "拒绝审核时必须提供拒绝原因",
      });
    }

    const hotel = await HotelModel.findById(id);
    console.log("🔍 找到的酒店:", hotel ? hotel._id : "未找到");

    if (!hotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    const snapshot = hotel.toObject();
    const snapshotWithoutId = { ...snapshot };
    delete (snapshotWithoutId as any)._id;
    delete (snapshotWithoutId as any).__v;
    delete (snapshotWithoutId as any).auditHistory;

    const updateData: any = {
      status,
      updateTime: new Date(),
      $push: {
        auditHistory: {
          action: status === "approved" ? "audit_approved" : "audit_rejected",
          status,
          rejectReason: status === "rejected" ? rejectReason : "",
          operatorRole: "admin",
          timestamp: new Date(),
          snapshot: snapshotWithoutId,
        },
      },
    };

    if (status === "rejected") {
      updateData.rejectReason = rejectReason;
    } else {
      updateData.rejectReason = undefined;
      updateData.isActive = true;
    }

    console.log("🔍 执行审核更新操作...");
    const updatedHotel = await HotelModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    console.log(
      "🔍 审核后的酒店:",
      updatedHotel ? updatedHotel._id : "更新失败",
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    try {
      if (hotel.ownerId) {
        const ownerIdStr = String(hotel.ownerId);
        const message =
          status === "approved"
            ? `您的酒店"${hotel.name}"审核已通过，现已上线`
            : `您的酒店"${hotel.name}"审核被拒绝：${rejectReason}`;

        await NotificationModel.create({
          type: "audit_result",
          hotelId: id,
          hotelName: hotel.name,
          ownerId: ownerIdStr,
          status: "unread",
          message,
        });

        console.log(`✅ 已为商户创建审核结果通知:`, {
          ownerId: ownerIdStr,
          hotelName: hotel.name,
          status,
          message,
        });
      } else {
        console.warn(`⚠️ 酒店没有 ownerId，无法创建通知 - hotelId: ${id}`);
      }
    } catch (notificationError: any) {
      console.error("❌ 创建审核通知失败:", {
        error: notificationError.message,
        ownerId: hotel.ownerId,
        hotelId: id,
      });
    }

    res.json({
      message:
        status === "approved" ? "审核通过成功，酒店已自动上线" : "审核拒绝成功",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("提交审核结果失败:", error);
    res.status(500).json({ message: "提交审核结果失败", error });
  }
});
// PATCH /api/admin/hotels/:id/toggle - 切换发布状态
router.patch("/hotels/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await HotelModel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    const newIsActive = !hotel.isActive;

    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      {
        isActive: newIsActive,
        updateTime: new Date(),
      },
      { new: true },
    );

    res.json({
      message: newIsActive ? "酒店已恢复上线" : "酒店已下线",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("切换发布状态失败:", error);
    res.status(500).json({ message: "切换发布状态失败", error });
  }
});

export default router;
