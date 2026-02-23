import { Router } from "express";
import { FeedbackModel } from "../models/Feedback.js";
import { NotificationModel } from "../models/Notification.js";
import { HotelModel } from "../models/Hotel.js";
const router = Router();

/**
 * @route   POST /api/feedback
 * @desc    商户提交反馈
 */
router.post("/", async (req, res) => {
  try {
    const { hotelId, ownerId, content, notificationId } = req.body;

    const newFeedback = await FeedbackModel.create({
      hotelId,
      ownerId,
      content,
      notificationId,
      status: "pending",
    });

    res.status(201).json({ success: true, data: newFeedback });
  } catch (error) {
    res.status(500).json({ success: false, message: "提交反馈失败", error });
  }
});

/**
 * @route   GET /api/feedback/list
 * @desc    管理员：获取反馈列表（支持按状态过滤）
 */
router.get("/list", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const list = await FeedbackModel.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: "获取列表失败" });
  }
});

/**
 * @route   PATCH /api/feedback/:id/reply
 * @desc    管理员：回复反馈
 */
router.patch("/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    // 先查找反馈，获取 ownerId 和 hotelId
    const feedback = await FeedbackModel.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "反馈不存在" });
    }

    const updated = await FeedbackModel.findByIdAndUpdate(
      id,
      {
        reply,
        status: "replied",
        repliedAt: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "反馈不存在" });
    }

    // 创建通知：管理员已回复反馈
    try {
      // 获取酒店名称（如果有 hotelId）
      let hotelName = "";
      if (feedback.hotelId) {
        const hotel = await HotelModel.findById(feedback.hotelId);
        if (hotel) {
          hotelName = hotel.name;
        }
      }

      const message = hotelName
        ? `管理员已回复您关于酒店"${hotelName}"的反馈`
        : "管理员已回复您的反馈";

      // 确保 ownerId 是字符串格式
      const ownerIdStr = String(feedback.ownerId);

      const notification = await NotificationModel.create({
        type: "feedback_reply",
        hotelId: feedback.hotelId,
        hotelName: hotelName || undefined,
        ownerId: ownerIdStr, // 确保是字符串
        status: "unread",
        message,
        relatedId: id, // 关联的反馈ID
      });

      console.log(`已为商户创建反馈回复通知:`, {
        notificationId: notification._id.toString(),
        ownerId: ownerIdStr,
        ownerIdType: typeof ownerIdStr,
        ownerIdValue: JSON.stringify(ownerIdStr), // 添加：查看实际值
        message,
      });
    } catch (notificationError: any) {
      // 通知创建失败不影响回复结果，只记录错误
      console.error("❌ 创建通知失败:", {
        error: notificationError.message,
        ownerId: feedback.ownerId,
        feedbackId: id,
      });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "回复操作失败" });
  }
});

export default router;