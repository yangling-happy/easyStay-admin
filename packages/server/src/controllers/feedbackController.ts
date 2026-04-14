import type { NextFunction, Request, Response } from "express";
import { FeedbackModel } from "../models/Feedback.js";
import { AppError } from "../middleware/errorMiddleware.js";
import {
  getHotelNameById,
  mapFeedbackListWithHotelInfo,
} from "../services/feedbackService.js";
import { logger } from "../services/logger.js";
import {
  notifyAdminsOfNewFeedback,
  notifyMerchantFeedbackReply,
} from "../services/notificationService.js";

export async function submitFeedback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { hotelId, ownerId, content, notificationId, images } = req.body;

    const newFeedback = await FeedbackModel.create({
      hotelId,
      ownerId,
      content,
      notificationId,
      images: Array.isArray(images) ? images : [],
      status: "pending",
    });

    const hotelName = await getHotelNameById(
      hotelId ? String(hotelId) : undefined,
    );

    await notifyAdminsOfNewFeedback({
      feedbackId: String(newFeedback._id),
      hotelId: hotelId ? String(hotelId) : undefined,
      hotelName: hotelName || undefined,
    });

    return res.status(201).json({ success: true, data: newFeedback });
  } catch (error) {
    logger.error("提交反馈失败", error);
    return next(error);
  }
}

export async function getFeedbackList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.query;
    const statusValue = Array.isArray(status) ? status[0] : status;
    const filter: any =
      statusValue === "pending" || statusValue === "replied"
        ? { status: statusValue }
        : {};

    const list = await FeedbackModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    const listWithHotelName = await mapFeedbackListWithHotelInfo(list as any[]);

    return res.json({ success: true, data: listWithHotelName });
  } catch (error) {
    logger.error("获取反馈列表失败", error);
    return next(error);
  }
}

export async function replyFeedback(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = String(req.params.id || "");
    const { reply } = req.body;

    const feedback = await FeedbackModel.findById(id);
    if (!feedback) {
      return next(new AppError("反馈不存在", 404));
    }

    const updated = await FeedbackModel.findByIdAndUpdate(
      id,
      {
        reply,
        status: "replied",
        repliedAt: new Date(),
      },
      { new: true },
    );

    if (!updated) {
      return next(new AppError("反馈不存在", 404));
    }

    const hotelName = await getHotelNameById(
      feedback.hotelId ? String(feedback.hotelId) : undefined,
    );

    await notifyMerchantFeedbackReply({
      feedbackId: id,
      ownerId: String(feedback.ownerId),
      hotelId: feedback.hotelId ? String(feedback.hotelId) : undefined,
      hotelName: hotelName || undefined,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    logger.error("回复反馈失败", error);
    return next(error);
  }
}
