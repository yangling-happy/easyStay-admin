import express from "express";
import type { Request } from "express";
import type { Response } from "express";
import { HotelModel } from "../models/Hotel.js";
import { auth } from "../middleware/authMiddleware.js";

//扩展 Express 的 Request 类型定义
interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
    // 根据你 Token 中存放的信息添加字段
  };
}

const router = express.Router();

// 1. POST /api/hotels - 创建酒店
router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotelData = {
      ...req.body,
      ownerId: req.user?.userId, // 使用可选链，安全获取
      status: "pending",
      createTime: new Date(),
      updateTime: new Date(),
    };

    const hotel = new HotelModel(hotelData);
    const savedHotel = await hotel.save();

    res.status(201).json({ success: true, data: savedHotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// 2. GET /api/hotels/records - 获取我的申请记录
router.get("/records", auth, async (req: AuthRequest, res: Response) => {
  try {
    const query = {
      ownerId: req.user?.userId,
      isDeleted: false,
    };

    // 排序逻辑：按 updateTime 倒序，解决“申请恢复后找不到”的问题
    const hotels = await HotelModel.find(query).sort({ updateTime: -1 });

    res.json({ success: true, data: hotels });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// 3. PATCH /api/hotels/:id/offline - 商户自主下线
router.patch("/:id/offline", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        isActive: false,
        updateTime: new Date(),
      },
      { new: true },
    );

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }
    res.json({ success: true, message: "酒店已成功下线", data: hotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// 4. POST /api/hotels/:id/re-apply - 恢复上线申请
router.post("/:id/re-apply", auth, async (req: AuthRequest, res: Response) => {
  try {
    const hotel = await HotelModel.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.userId },
      {
        status: "pending",
        isActive: false,
        rejectReason: "", // 清空旧的拒绝原因
        updateTime: new Date(), // 更新时间，确保排序置顶
      },
      { new: true },
    );

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }
    res.json({ success: true, message: "已提交重新上线申请", data: hotel });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

// 5. GET /api/hotels/detail/:id - 获取酒店详情（跳过认证，因移动端没注册用户）
router.get("/detail/:id", async (req: Request, res: Response) => {
  try {
    const hotel = await HotelModel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: "未找到酒店" });
    }

    // 只返回部分信息
    const publicHotelData = {
      id: hotel._id.toString(),
      name: hotel.name,
      nameEn: hotel.nameEn,
      address: hotel.address,
      star: hotel.star,
      openingDate: hotel.openingDate,
      photos: hotel.photos,
      nearbyInfo: hotel.nearbyInfo,
      roomTypes: hotel.roomTypes,
      status: hotel.status,
      isActive: hotel.isActive,
    };

    res.json({ success: true, data: publicHotelData });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;
