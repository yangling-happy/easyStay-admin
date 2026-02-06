import express from "express";
import { HotelModel } from "../models/Hotel.js";

const router = express.Router();

// POST /api/hotels - 创建酒店
router.post("/", async (req, res) => {
  try {
    console.log("收到创建酒店请求:", req.body);

    const hotelData = {
      ...req.body,
      // 确保时间格式
      createTime: new Date(),
      updateTime: new Date(),
    };

    const hotel = new HotelModel(hotelData);
    const savedHotel = await hotel.save();

    console.log("酒店保存成功:", savedHotel._id);

    res.status(201).json({
      success: true,
      data: savedHotel,
    });
  } catch (error: any) {
    console.error("保存酒店失败:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// GET /api/hotels - 获取酒店列表/申请记录
router.get("/", async (req, res) => {
  try {
    // 1. 从 URL 的问号后面拿参数 (req.query)
    // 前端调用可能是: /api/hotels?ownerId=用户ID
    const { ownerId, status } = req.query;

    // 2. 默认查询条件：没被删除的
    const query: Record<string, any> = { isDeleted: false };

    // 3. 如果传了商户ID，就只查这个商户的（这就是申请记录的关键）
    if (ownerId) {
      query.ownerId = ownerId;
    }

    // 4. 如果传了状态（比如只想看审核通过的），就加上状态过滤
    if (status) {
      query.status = status;
    }

    // 5. 去数据库查
    const hotels = await HotelModel.find(query)
      .sort({ createTime: -1 }) // 新申请的排在最前面
      .lean();

    res.json({
      success: true,
      data: hotels,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: "未知错误" });
    }
  }
});

export default router;
