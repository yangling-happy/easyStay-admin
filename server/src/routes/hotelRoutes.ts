import express from 'express';
import { HotelModel } from '../models/Hotel.js';

const router = express.Router();

// POST /api/hotels：接收前端数据，存入MongoDB，默认status: "pending"
router.post('/', async (req, res) => {
  try {
    // 从请求体中获取酒店数据
    const hotelData = {
      ...req.body,
      status: req.body.status || 'pending', // 默认状态为pending
      createTime: new Date(),
      updateTime: new Date()
    };

    // 创建新酒店
    const newHotel = new HotelModel(hotelData);
    await newHotel.save();

    // 返回创建成功的酒店数据
    res.status(201).json(newHotel);
  } catch (error) {
    console.error('创建酒店失败:', error);
    res.status(500).json({ message: '创建酒店失败', error });
  }
});

// GET /api/my/hotels：根据当前登录ID查询数据
router.get('/my/hotels', async (req, res) => {
  try {
    // 从请求头或查询参数中获取用户ID
    // 注意：在实际生产环境中，应该从JWT token中解析用户ID
    const ownerId = req.headers['user-id'] || req.query.ownerId;

    if (!ownerId) {
      return res.status(400).json({ message: '缺少用户ID' });
    }

    // 查询该用户的所有酒店，排除已删除的
    const hotels = await HotelModel.find({
      ownerId,
      isDeleted: false
    }).sort({ updateTime: -1 });

    res.json(hotels);
  } catch (error) {
    console.error('获取酒店列表失败:', error);
    res.status(500).json({ message: '获取酒店列表失败', error });
  }
});

// GET /api/hotels/:id：根据ID获取单个酒店
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hotel = await HotelModel.findById(id);

    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    res.json(hotel);
  } catch (error) {
    console.error('获取酒店详情失败:', error);
    res.status(500).json({ message: '获取酒店详情失败', error });
  }
});

// PUT /api/hotels/:id：更新酒店信息
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const hotelData = {
      ...req.body,
      updateTime: new Date()
    };

    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      hotelData,
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    res.json(updatedHotel);
  } catch (error) {
    console.error('更新酒店失败:', error);
    res.status(500).json({ message: '更新酒店失败', error });
  }
});

// POST /api/hotels/delete：逻辑删除酒店
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;

    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      { isDeleted: true, updateTime: new Date() },
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    res.json({ message: '删除成功', hotel: updatedHotel });
  } catch (error) {
    console.error('删除酒店失败:', error);
    res.status(500).json({ message: '删除酒店失败', error });
  }
});

// POST /api/hotels/restore：恢复酒店
router.post('/restore', async (req, res) => {
  try {
    const { id } = req.body;

    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      { isDeleted: false, updateTime: new Date() },
      { new: true }
    );

    if (!updatedHotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    res.json({ message: '恢复成功', hotel: updatedHotel });
  } catch (error) {
    console.error('恢复酒店失败:', error);
    res.status(500).json({ message: '恢复酒店失败', error });
  }
});

export default router;