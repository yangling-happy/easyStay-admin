import express from "express";
import { HotelModel } from "../models/Hotel.js";
import { auth } from "../middleware/authMiddleware.js"; // 引入中间件

const router = express.Router();

// 1. POST /api/hotels - 创建酒店 (加上 auth 中间件)
router.post("/", auth, async (req: any, res) => {
  try {
    // 💡 关键改动：ownerId 不再依赖前端传参，而是从 Token 中解析
    const hotelData = {
      ...req.body,
      ownerId: req.user.userId, // 这里就是中间件里挂载的信息
      status: 'pending',        // 强制初始状态为审核中
      createTime: new Date(),
      updateTime: new Date(),
    };

    const hotel = new HotelModel(hotelData);
    const savedHotel = await hotel.save();

    res.status(201).json({ success: true, data: savedHotel });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET /api/hotels - 获取我的申请记录 (加上 auth 中间件)
router.get("/records", auth, async (req: any, res) => {
  try {
    // 关键改动：直接查“我”的记录
    const query = { 
      ownerId: req.user.userId, // 从 Token 拿 ID，别人查不了你的数据
      isDeleted: false 
    };

    const hotels = await HotelModel.find(query).sort({ createTime: -1 });

    res.json({ success: true, data: hotels });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;