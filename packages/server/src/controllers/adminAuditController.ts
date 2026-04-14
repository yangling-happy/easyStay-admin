import type { Request, Response } from "express";
import { HotelModel } from "../models/Hotel.js";
import type { AdminAuthRequest } from "../middleware/adminMiddleware.js";
import { buildAdminAuditUpdateData } from "../services/auditService.js";
import {
  notifyMerchantAuditResult,
  notifyMerchantHotelStatusChangedByAdmin,
} from "../services/notificationService.js";
import { sanitizeAuditSnapshot } from "../services/hotelService.js";

export async function submitHotelAudit(req: Request, res: Response) {
  try {
    const id = String(req.params.id || "");
    const { status, rejectReason } = req.body as {
      status: "approved" | "rejected";
      rejectReason?: string;
    };

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "无效的审核状态，只能是 approved 或 rejected",
      });
    }

    if (status === "rejected" && !rejectReason) {
      return res.status(400).json({
        message: "拒绝审核时必须提供拒绝原因",
      });
    }

    const hotel = await HotelModel.findById(id);
    if (!hotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    const updateData = buildAdminAuditUpdateData({
      status,
      rejectReason,
      snapshot: hotel.toObject() as Record<string, any>,
    });

    const updatedHotel = await HotelModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedHotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    if (hotel.ownerId) {
      await notifyMerchantAuditResult({
        hotelId: id,
        hotelName: hotel.name,
        ownerId: String(hotel.ownerId),
        status,
        rejectReason,
      });
    } else {
      console.warn(`酒店没有 ownerId，无法创建通知 - hotelId: ${id}`);
    }

    return res.json({
      message:
        status === "approved" ? "审核通过成功，酒店已自动上线" : "审核拒绝成功",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("提交审核结果失败:", error);
    return res.status(500).json({ message: "提交审核结果失败", error });
  }
}

export async function toggleHotelPublishStatus(
  req: AdminAuthRequest,
  res: Response,
) {
  try {
    const id = String(req.params.id || "");
    const hotel = await HotelModel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: "酒店不存在" });
    }

    const newIsActive = !hotel.isActive;
    const snapshot = sanitizeAuditSnapshot(
      hotel.toObject() as Record<string, any>,
    );

    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      {
        isActive: newIsActive,
        updateTime: new Date(),
        $push: {
          auditHistory: {
            action: newIsActive ? "online" : "offline",
            status: hotel.status,
            operatorId: req.user?.userId,
            operatorRole: "admin",
            timestamp: new Date(),
            beforeStatus: hotel.isActive,
            afterStatus: newIsActive,
            snapshot,
          },
        },
      },
      { new: true },
    );

    if (updatedHotel?.ownerId) {
      await notifyMerchantHotelStatusChangedByAdmin({
        hotelId: String(id),
        hotelName: updatedHotel.name,
        ownerId: String(updatedHotel.ownerId),
        isOnline: newIsActive,
        operatorId: req.user?.userId,
      });
    }

    return res.json({
      message: newIsActive ? "酒店已恢复上线" : "酒店已下线",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("切换发布状态失败:", error);
    return res.status(500).json({ message: "切换发布状态失败", error });
  }
}
