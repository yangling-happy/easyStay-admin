import type { Request, Response } from "express";
import { NotificationModel } from "../models/Notification.js";
import {
  buildNotificationQuery,
  getPagination,
  getUnreadNotificationCount,
  getUserIdFromToken,
  setNoCacheHeaders,
} from "../services/notificationQueryService.js";

export async function getNotifications(req: Request, res: Response) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "请先登录" });
    }

    const { type, status } = req.query;
    const { page, pageSize, skip } = getPagination(
      req.query as Record<string, unknown>,
    );
    const query = buildNotificationQuery({ ownerId, type, status });

    console.log(
      `🔍 查询通知 - ownerId: ${ownerId}, query:`,
      JSON.stringify(query),
    );

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await NotificationModel.countDocuments(query);
    const unreadCount = await getUnreadNotificationCount(ownerId);

    const allNotifications = await NotificationModel.find({}).limit(5);
    console.log(
      "📋 数据库中的通知示例（前5条）:",
      allNotifications.map((n) => ({
        id: n._id.toString(),
        ownerId: n.ownerId,
        ownerIdType: typeof n.ownerId,
        message: n.message,
      })),
    );

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
  } catch (error: any) {
    console.error("获取通知列表失败:", error);
    return res.status(500).json({
      success: false,
      message: "获取通知列表失败",
      error: error.message,
    });
  }
}

export async function markNotificationAsRead(req: Request, res: Response) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "请先登录" });
    }

    const { id } = req.params;
    const notification = await NotificationModel.findOne({ _id: id, ownerId });
    if (!notification) {
      return res.status(404).json({ success: false, message: "通知不存在" });
    }

    notification.status = "read";
    await notification.save();

    return res.json({
      success: true,
      message: "已标记为已读",
      data: notification,
    });
  } catch (error: any) {
    console.error("标记通知已读失败:", error);
    return res.status(500).json({
      success: false,
      message: "标记通知已读失败",
      error: error.message,
    });
  }
}

export async function getNotificationDetail(req: Request, res: Response) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "请先登录" });
    }

    const { id } = req.params;
    const notification = await NotificationModel.findOne({
      _id: id,
      ownerId: String(ownerId),
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "通知不存在" });
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
  } catch (error: any) {
    console.error("获取通知详情失败:", error);
    return res.status(500).json({
      success: false,
      message: "获取通知详情失败",
      error: error.message,
    });
  }
}

export async function markAllNotificationsAsRead(req: Request, res: Response) {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({ success: false, message: "请先登录" });
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
  } catch (error: any) {
    console.error("批量标记已读失败:", error);
    return res.status(500).json({
      success: false,
      message: "批量标记已读失败",
      error: error.message,
    });
  }
}
