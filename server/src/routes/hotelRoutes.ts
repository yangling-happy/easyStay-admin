import express from 'express';
import { HotelModel } from '../models/Hotel.js';

const router = express.Router();

// POST /api/hotels - 创建酒店
router.post('/', async (req, res) => {
  try {
    console.log('收到创建酒店请求:', req.body);
    
    const hotelData = {
      ...req.body,
      // 确保时间格式
      createTime: new Date(),
      updateTime: new Date()
    };
    
    const hotel = new HotelModel(hotelData);
    const savedHotel = await hotel.save();
    
    console.log('酒店保存成功:', savedHotel._id);
    
    res.status(201).json({
      success: true,
      data: savedHotel
    });
  } catch (error: any) {
    console.error('保存酒店失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/hotels - 获取酒店列表
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    
    const query: any = { isDeleted: false };
    if (ownerId) {
      query.ownerId = ownerId;
    }
    
    const hotels = await HotelModel.find(query)
      .sort({ createTime: -1 })
      .lean();
    
    res.json({
      success: true,
      data: hotels
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;