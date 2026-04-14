import type { NextFunction, Request, Response } from "express";
import { NotificationModel } from "../models/Notification.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { logger } from "../services/logger.js";
import {
  buildNotificationQuery,
  getPagination,
  getUnreadNotificationCount,
  getUserIdFromToken,
  setNoCacheHeaders,
} from "../services/notificationQueryService.js";

export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return next(new AppError("请先登录", 401));
    }

    const { type, status } = req.query;
    const { page, pageSize, skip } = getPagination(
      req.query as Record<string, unknown>,
    );
    const query = buildNotificationQuery({ ownerId, type, status });

    logger.debug("查询通知", { ownerId, query });

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await NotificationModel.countDocuments(query);
    const unreadCount = await getUnreadNotificationCount(ownerId);

    setNoCacheHeaders(res);

    return res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
        unreadCount,
      },
    });
  } catch (error) {
    logger.error("获取通知列表失败", error);
    return next(error);
  }
}

export async function markNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return next(new AppError("请先登录", 401));
    }

    const { id } = req.params;
    const notification = await NotificationModel.findOne({ _id: id, ownerId });
    if (!notification) {
      return next(new AppError("通知不存在", 404));
    }

    notification.status = "read";
    await notification.save();

    return res.json({
      success: true,
      message: "已标记为已读",
      data: notification,
    });
  } catch (error) {
    logger.error("标记通知已读失败", error);
    return next(error);
  }
}

export async function getNotificationDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return next(new AppError("请先登录", 401));
    }

    const { id } = req.params;
    const notification = await NotificationModel.findOne({
      _id: id,
      ownerId: String(ownerId),
    });

    if (!notification) {
      return next(new AppError("通知不存在", 404));
    }

    let relatedFeedback = null;
    if (notification.type === "feedback_reply" && notification.relatedId) {
      const { FeedbackModel } = await import("../models/Feedback.js");
      relatedFeedback = await FeedbackModel.findById(notification.relatedId);
    }

    return res.json({
      success: true,
      data: {
        notification,
        relatedFeedback: relatedFeedback
          ? {
              id: relatedFeedback._id.toString(),
              content: relatedFeedback.content,
              reply: relatedFeedback.reply,
              status: relatedFeedback.status,
              createdAt: relatedFeedback.createdAt,
              repliedAt: relatedFeedback.repliedAt,
            }
          : null,
      },
    });
  } catch (error) {
    logger.error("获取通知详情失败", error);
    return next(error);
  }
}

export async function markAllNotificationsAsRead(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return next(new AppError("请先登录", 401));
    }

    const result = await NotificationModel.updateMany(
      { ownerId, status: "unread" },
      { status: "read" },
    );

    return res.json({
      success: true,
      message: `已标记 ${result.modifiedCount} 条通知为已读`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    logger.error("批量标记已读失败", error);
    return next(error);
  }
}
