import type { NextFunction, Request, Response } from "express";
import { HotelModel } from "../models/Hotel.js";
import { calculateDynamicPrices } from "../utils/priceUtils.js";
import {
  buildHotelUpdatePayload,
  createHotelPayload,
  normalizeDateToMonthDay,
  sanitizeAuditSnapshot,
  splitRoomTypesByAvailability,
} from "../services/hotelService.js";
import {
  notifyAdminsOfPendingHotel,
  notifyMerchantHotelOffline,
} from "../services/notificationService.js";
import type { AuthRequest } from "../types/http.js";
import { logger } from "../services/logger.js";
import { AppError } from "../middleware/errorMiddleware.js";

function toPositiveInt(value: unknown, fallback: number) {
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export async function createHotel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotelData = createHotelPayload({
      body: req.body || {},
      userId: req.user?.userId,
    });

    const hotel = new HotelModel(hotelData);
    const savedHotel = await hotel.save();

    if (!savedHotel.isIncomplete) {
      await notifyAdminsOfPendingHotel(String(savedHotel._id), savedHotel.name);
    }

    logger.info("酒店保存成功", {
      id: savedHotel._id,
      name: savedHotel.name,
      isIncomplete: savedHotel.isIncomplete,
      completionStatus: savedHotel.completionStatus,
      status: savedHotel.status,
    });

    return res.status(201).json({ success: true, data: savedHotel });
  } catch (error: unknown) {
    logger.error("保存酒店失败", error);
    return next(error);
  }
}

export async function getMerchantHotelRecords(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { scope } = req.query as { scope?: string };

    const query: any = {
      ownerId: req.user?.userId,
      isDeleted: false,
    };

    if (scope === "audit") {
      query.status = { $in: ["pending", "approved", "rejected", "offline"] };
    }

    const hotels = await HotelModel.find(query).sort({ createTime: -1 });
    return res.json({ success: true, data: hotels });
  } catch (error: unknown) {
    logger.error("获取酒店记录失败", error);
    return next(error);
  }
}

export async function getHotelsByOwnerId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { ownerId } = req.params;

    const hotels = await HotelModel.find({
      ownerId,
      isDeleted: false,
      isIncomplete: false,
      status: { $in: ["pending", "approved", "rejected", "offline"] },
    }).select("_id name");

    return res.json({ success: true, data: hotels });
  } catch (error: unknown) {
    logger.error("获取所有者酒店失败", error);
    return next(error);
  }
}

export async function getHotelDetail(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return next(new AppError("未找到酒店", 404));
    }

    return res.json({ success: true, data: hotel });
  } catch (error: unknown) {
    logger.error("获取酒店详情失败", error);
    return next(error);
  }
}

export async function getPublicHotelDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotel = await HotelModel.findById(req.params.id);

    if (!hotel) {
      return next(new AppError("未找到酒店", 404));
    }

    const rooms = toPositiveInt(req.query.rooms, 1);
    const guests = toPositiveInt(req.query.guests, 1);
    const startDate = normalizeDateToMonthDay(req.query.startDate as string);
    const endDate = normalizeDateToMonthDay(req.query.endDate as string);

    if (hotel.roomTypes && Array.isArray(hotel.roomTypes)) {
      (hotel as any).roomTypes = calculateDynamicPrices(
        hotel.roomTypes,
        startDate,
        endDate,
      );
    }

    const { available, unavailable } = splitRoomTypesByAvailability(
      hotel.roomTypes,
      rooms,
      guests,
    );

    const publicHotelData = {
      id: hotel._id.toString(),
      name: hotel.name,
      nameEn: hotel.nameEn,
      address: hotel.address,
      star: hotel.star,
      openingDate: hotel.openingDate,
      photos: hotel.photos,
      roomTypes: {
        available,
        unavailable,
      },
      amenities: hotel.amenities,
      status: hotel.status,
      isActive: hotel.isActive,
    };

    return res.json({ success: true, data: publicHotelData });
  } catch (error: unknown) {
    return next(error);
  }
}

export async function updateHotel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return next(new AppError("未找到酒店", 404));
    }

    const currentVersion = hotel.version || 0;
    const newVersion = req.body.version || 0;
    if (newVersion !== currentVersion) {
      return res
        .status(409)
        .json({ success: false, message: "数据已被更新，请刷新页面后重试" });
    }

    const isMerchant = (req.user?.role || "merchant") === "merchant";
    const { updateData, shouldForcePending } = buildHotelUpdatePayload({
      body: req.body || {},
      ownerId: String(hotel.ownerId || ""),
      currentVersion,
      isMerchant,
    });

    const snapshot = sanitizeAuditSnapshot(
      hotel.toObject() as Record<string, any>,
    );

    const updatedHotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      updateData,
      { new: true },
    );

    if (!updatedHotel) {
      return next(new AppError("未找到酒店", 404));
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
      snapshot,
    };

    await HotelModel.updateOne(
      { _id: req.params.id },
      { $push: { auditHistory: auditEntry } },
    );

    if (shouldForcePending) {
      await notifyAdminsOfPendingHotel(
        String(updatedHotel._id),
        updatedHotel.name,
      );
    }

    logger.info("酒店更新成功", {
      id: updatedHotel._id,
      name: updatedHotel.name,
      isIncomplete: updatedHotel.isIncomplete,
      completionStatus: updatedHotel.completionStatus,
      status: updatedHotel.status,
    });

    return res.json({ success: true, data: updatedHotel });
  } catch (error: unknown) {
    logger.error("更新酒店失败", error);
    return next(error);
  }
}

export async function offlineHotel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return next(new AppError("未找到酒店", 404));
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

    await notifyMerchantHotelOffline({
      hotelId: hotel._id.toString(),
      hotelName: hotel.name,
      ownerId: hotel.ownerId ? hotel.ownerId.toString() : "",
    });

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

    return res.json({
      success: true,
      data: updatedHotel,
      message: "酒店已下线",
    });
  } catch (error: unknown) {
    logger.error("下线酒店失败", error);
    return next(error);
  }
}

export async function onlineHotel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return next(new AppError("未找到酒店", 404));
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
      return next(new AppError("更新酒店失败", 404));
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

    return res.json({ success: true, data: updatedHotel });
  } catch (error: unknown) {
    logger.error("上线酒店失败", error);
    return next(error);
  }
}

export async function reApplyHotel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return next(new AppError("未找到酒店", 404));
    }

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
      return next(new AppError("更新酒店失败", 404));
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

    return res.json({
      success: true,
      data: updatedHotel,
      message: "申请已提交，请关注审核记录",
    });
  } catch (error: unknown) {
    logger.error("申请恢复上线失败", error);
    return next(error);
  }
}

export async function restoreHotel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.body as { id: string };

    const hotel = await HotelModel.findOne({
      _id: id,
      ownerId: req.user?.userId,
      isDeleted: true,
    });

    if (!hotel) {
      return next(new AppError("未找到已删除的酒店", 404));
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
      return next(new AppError("恢复酒店失败", 404));
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

    return res.json({ success: true, data: updatedHotel });
  } catch (error: unknown) {
    logger.error("恢复酒店失败", error);
    return next(error);
  }
}

export async function deleteHotel(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const hotel = await HotelModel.findOne({
      _id: req.params.id,
      ownerId: req.user?.userId,
    });

    if (!hotel) {
      return next(new AppError("未找到酒店", 404));
    }

    await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        isDeleted: true,
        updateTime: new Date(),
      },
    );

    return res.json({ success: true, message: "酒店已删除" });
  } catch (error: unknown) {
    return next(error);
  }
}

export async function batchDeleteHotels(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { ids } = req.body as { ids: string[] };

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
      return next(new AppError("未找到可删除的酒店", 404));
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
        logger.error(`删除酒店 ${hotel._id} 失败`, error);
        failedCount++;
        failedIds.push(String(hotel._id));
      }
    }

    logger.info("批量删除日志", {
      totalCount: ids.length,
      successCount,
      failedCount,
      failedIds,
      deleteLogs,
    });

    return res.json({
      success: true,
      message: `成功删除 ${successCount} 家酒店${failedCount > 0 ? `，失败 ${failedCount} 家` : ""}`,
      data: {
        successCount,
        failedCount,
        failedIds,
      },
    });
  } catch (error: unknown) {
    logger.error("批量删除失败", error);
    return next(error);
  }
}
