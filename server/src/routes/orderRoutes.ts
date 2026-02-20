import express from "express";
import type { Request } from "express";
import type { Response } from "express";
import { OrderModel } from "../models/Order.js";
import { auth } from "../middleware/authMiddleware.js";
import { HotelModel } from "../models/Hotel.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

const router = express.Router();

router.get("/list", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { status, hotelId } = req.query;
    const query: any = { isDeleted: false };

    if (status) {
      query.status = status;
    }

    const hotels = await HotelModel.find({ ownerId: req.user?.userId });
    const hotelIds = hotels.map((hotel) => hotel._id.toString());

    if (hotelId) {
      if (hotelIds.includes(hotelId as string)) {
        query.hotelId = hotelId;
      } else {
        return res.status(403).json({ success: false, message: "无权访问该酒店的订单" });
      }
    } else {
      query.hotelId = { $in: hotelIds };
    }

    const orders = await OrderModel.find(query).sort({ createTime: -1 });

    res.json({ success: true, data: orders });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("获取订单列表失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get("/detail/:id", auth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "未找到订单" });
    }

    const hotels = await HotelModel.find({ ownerId: req.user?.userId });
    const hotelIds = hotels.map((hotel) => hotel._id.toString());

    if (!hotelIds.includes(order.hotelId)) {
      return res.status(403).json({ success: false, message: "无权访问该订单" });
    }

    res.json({ success: true, data: order });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("获取订单详情失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.patch("/:id/status", auth, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "checkin", "checkout", "cancelled", "refunded"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "无效的订单状态" });
    }

    const order = await OrderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "未找到订单" });
    }

    const hotels = await HotelModel.find({ ownerId: req.user?.userId });
    const hotelIds = hotels.map((hotel) => hotel._id.toString());

    if (!hotelIds.includes(order.hotelId)) {
      return res.status(403).json({ success: false, message: "无权修改该订单" });
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status, updateTime: new Date() },
      { new: true }
    );

    res.json({ success: true, message: "订单状态已更新", data: updatedOrder });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("更新订单状态失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.get("/admin/list", async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = { isDeleted: false };

    if (status) {
      query.status = status;
    }

    const orders = await OrderModel.find(query).sort({ createTime: -1 });

    res.json({ success: true, data: orders });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    console.error("管理员获取订单列表失败:", error);
    res.status(500).json({ success: false, message: errorMessage });
  }
});

router.post("/", auth, async (req: AuthRequest, res: Response) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user?.userId,
      orderNumber: `ORD${Date.now()}`,
      createTime: new Date(),
      updateTime: new Date(),
    };

    const order = new OrderModel(orderData);
    const savedOrder = await order.save();

    res.status(201).json({ success: true, data: savedOrder });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "未知错误";
    res.status(500).json({ success: false, message: errorMessage });
  }
});

export default router;
