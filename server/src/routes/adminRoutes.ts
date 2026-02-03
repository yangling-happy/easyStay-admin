import express from 'express';  // 导入Express框架
import { HotelModel } from '../models/Hotel.js';  // 导入酒店数据模型

const router = express.Router();  // 创建一个路由对象

// GET /api/admin/hotels/pending - 获取待审核列表
router.get('/hotels/pending', async (req, res) => {
  try {
    const hotels = await HotelModel.find({
      status: 'pending',
      isDeleted: false
    }).sort({ createTime: -1 });
    
    // 将 MongoDB 的 _id 转换为 id
    const hotelsWithId = hotels.map(hotel => {
      const hotelObj = hotel.toObject(); // 转换为普通对象
      return {
        ...hotelObj,
        id: hotelObj._id.toString(), // 将 _id 转换为 id
        _id: undefined // 可选：删除 _id 字段
      };
    });
    
    res.json(hotelsWithId);
  } catch (error) {
    console.error('获取待审核列表失败:', error);
    res.status(500).json({ 
      message: '获取待审核列表失败', 
      error
    });
  }
});

// POST /api/admin/hotels/:id/audit - 提交审核结果
router.post('/hotels/:id/audit', async (req, res) => {
  // 当有人访问 POST /api/admin/hotels/某个ID/audit 时，执行这个函数
  try {
    const { id } = req.params;      // 从URL中获取酒店ID，比如 /hotels/123/audit
    const { status, rejectReason } = req.body;  // 从请求体中获取数据

    // 验证 status 是否有效
    if (!['approved', 'rejected'].includes(status)) {
      // 如果 status 不是 'approved' 或 'rejected'，返回错误
      return res.status(400).json({ 
        message: '无效的审核状态，只能是 approved 或 rejected' 
      });
    }

    // 如果拒绝，必须提供拒绝原因
    if (status === 'rejected' && !rejectReason) {
      return res.status(400).json({ 
        message: '拒绝审核时必须提供拒绝原因' 
      });
    }

    // 构建要更新的数据
    const updateData: any = {  // updateData 是要修改的数据
      status,                   // 更新审核状态
      updateTime: new Date()    // 更新修改时间
    };

    if (status === 'rejected') {
      updateData.rejectReason = rejectReason;  // 如果是拒绝，记录原因
    } else {
      // 如果通过审核，清空拒绝原因
      updateData.rejectReason = undefined;  // 设为 undefined
    }

    // 执行数据库更新
    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,           // 要更新哪个酒店（通过ID找到）
      updateData,   // 要更新的数据
      { new: true } // 返回更新后的文档（而不是更新前的）
    );

    // 如果没找到这个酒店
    if (!updatedHotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    // 返回成功结果
    res.json({ 
      message: status === 'approved' ? '审核通过成功' : '审核拒绝成功',
      hotel: updatedHotel  // 返回更新后的酒店信息
    });
  } catch (error) {
    // 出错处理
    console.error('提交审核结果失败:', error);
    res.status(500).json({ message: '提交审核结果失败', error });
  }
});


// PATCH /api/admin/hotels/:id/toggle - 切换发布状态
router.patch('/hotels/:id/toggle', async (req, res) => {
  // 当有人访问 PATCH /api/admin/hotels/某个ID/toggle 时，执行这个函数
  try {
    const { id } = req.params;  // 获取酒店ID
    
    // 先获取当前酒店信息
    const hotel = await HotelModel.findById(id);
    
    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    // 切换 isActive 状态（取反）
    const newIsActive = !hotel.isActive;  // true变false，false变true
    
    const updatedHotel = await HotelModel.findByIdAndUpdate(
      id,
      { 
        isActive: newIsActive,  // 更新状态
        updateTime: new Date()  // 更新时间
      },
      { new: true }
    );

    res.json({ 
      message: newIsActive ? '酒店已恢复上线' : '酒店已下线',
      hotel: updatedHotel 
    });
  } catch (error) {
    console.error('切换发布状态失败:', error);
    res.status(500).json({ message: '切换发布状态失败', error });
  }
});

export default router;  // 导出这个路由，让其他文件可以使用