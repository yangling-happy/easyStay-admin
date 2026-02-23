import express from "express";
import { NotificationModel } from "../models/Notification.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 辅助函数：从请求头获取用户 ID
const getUserIdFromToken = (req: express.Request): string | null => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // 确保返回字符串格式的 userId
    const userId = decoded.userId ? String(decoded.userId) : null;
    if (userId) {
      console.log(`🔑 从 Token 解析 userId: ${userId}`);
    }
    return userId;
  } catch (error) {
    console.error("解析 Token 失败:", error);
    return null;
  }
};

// GET /api/notification - 获取当前用户的通知列表
router.get("/", async (req, res) => {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
      });
    }

    const { type, status, page = 1, pageSize = 20 } = req.query;

    // 确保 ownerId 是字符串格式，用于查询
    const ownerIdStr = String(ownerId);
    const query: any = { ownerId: ownerIdStr };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 添加调试日志
    console.log(`🔍 查询通知 - ownerId: ${ownerIdStr}, query:`, JSON.stringify(query));

    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NotificationModel.countDocuments(query);

    // 调试：检查数据库中的所有通知（仅用于调试）
    const allNotifications = await NotificationModel.find({}).limit(5);
    console.log(`📋 数据库中的通知示例（前5条）:`, allNotifications.map(n => ({
      id: n._id.toString(),
      ownerId: n.ownerId,
      ownerIdType: typeof n.ownerId,
      message: n.message,
    })));

    const unreadCount = await NotificationModel.countDocuments({
      ownerId: ownerIdStr,
      status: "unread",
    });

    // 添加缓存控制头，防止 304 缓存问题
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    console.log(`📬 查询通知 - ownerId: ${ownerId}, 总数: ${total}, 未读: ${unreadCount}`);


    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total,
          totalPages: Math.ceil(total / Number(pageSize)),
        },
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error("获取通知列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取通知列表失败",
      error: error.message,
    });
  }
});

// PATCH /api/notifications/:id/read - 标记通知为已读
router.patch("/:id/read", async (req, res) => {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
      });
    }

    const { id } = req.params;

    const notification = await NotificationModel.findOne({
      _id: id,
      ownerId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "通知不存在",
      });
    }

    notification.status = "read";
    await notification.save();

    res.json({
      success: true,
      message: "已标记为已读",
      data: notification,
    });
  } catch (error: any) {
    console.error("标记通知已读失败:", error);
    res.status(500).json({
      success: false,
      message: "标记通知已读失败",
      error: error.message,
    });
  }
});

// GET /api/notifications/:id - 获取单个通知详情
router.get("/:id", async (req, res) => {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
      });
    }

    const { id } = req.params;
    const ownerIdStr = String(ownerId);

    const notification = await NotificationModel.findOne({
      _id: id,
      ownerId: ownerIdStr,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "通知不存在",
      });
    }

    // ✅ 如果是反馈回复类型，获取关联的反馈信息
    let relatedFeedback = null;
    if (notification.type === "feedback_reply" && notification.relatedId) {
      const { FeedbackModel } = await import("../models/Feedback.js");
      relatedFeedback = await FeedbackModel.findById(notification.relatedId);
    }

    res.json({
      success: true,
      data: {
        notification,
        relatedFeedback: relatedFeedback ? {
          id: relatedFeedback._id.toString(),
          content: relatedFeedback.content,
          reply: relatedFeedback.reply,
          status: relatedFeedback.status,
          createdAt: relatedFeedback.createdAt,
          repliedAt: relatedFeedback.repliedAt,
        } : null,
      },
    });
  } catch (error: any) {
    console.error("获取通知详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取通知详情失败",
      error: error.message,
    });
  }
});



// PATCH /api/notifications/read-all - 标记所有通知为已读
router.patch("/read-all", async (req, res) => {
  try {
    const ownerId = getUserIdFromToken(req);
    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
      });
    }

    const result = await NotificationModel.updateMany(
      { ownerId, status: "unread" },
      { status: "read" }
    );

    res.json({
      success: true,
      message: `已标记 ${result.modifiedCount} 条通知为已读`,
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error: any) {
    console.error("批量标记已读失败:", error);
    res.status(500).json({
      success: false,
      message: "批量标记已读失败",
      error: error.message,
    });
  }
});

export default router;