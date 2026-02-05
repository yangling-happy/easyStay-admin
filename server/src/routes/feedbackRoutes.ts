import { Router } from "express";
import { FeedbackModel } from "../models/Feedback.js";

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

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "回复操作失败" });
  }
});

export default router;