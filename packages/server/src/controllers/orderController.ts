import type { Request, Response } from "express";
import { OrderModel } from "../models/Order.js";
import {
  buildCreateOrderPayload,
  buildOrderQuery,
  getOwnerHotelIds,
  isValidOrderStatus,
} from "../services/orderService.js";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "未知错误";
}

export async function getOrderList(req: AuthRequest, res: Response) {
  try {
    const { status, hotelId } = req.query;
    const hotelIds = await getOwnerHotelIds(req.user?.userId);

    if (hotelId && !hotelIds.includes(String(hotelId))) {
      return res
        .status(403)
        .json({ success: false, message: "无权访问该酒店的订单" });
    }

    const query = buildOrderQuery({
      status,
      hotelId: hotelId ? String(hotelId) : { $in: hotelIds },
    });

    const orders = await OrderModel.find(query).sort({ createTime: -1 });
    return res.json({ success: true, data: orders });
  } catch (error: unknown) {
    console.error("获取订单列表失败:", error);
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error) });
  }
}

export async function getOrderDetail(req: AuthRequest, res: Response) {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "未找到订单" });
    }

    const hotelIds = await getOwnerHotelIds(req.user?.userId);
    if (!hotelIds.includes(order.hotelId)) {
      return res
        .status(403)
        .json({ success: false, message: "无权访问该订单" });
    }

    return res.json({ success: true, data: order });
  } catch (error: unknown) {
    console.error("获取订单详情失败:", error);
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error) });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const { status } = req.body as { status: string };
    if (!isValidOrderStatus(status)) {
      return res
        .status(400)
        .json({ success: false, message: "无效的订单状态" });
    }

    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "未找到订单" });
    }

    const hotelIds = await getOwnerHotelIds(req.user?.userId);
    if (!hotelIds.includes(order.hotelId)) {
      return res
        .status(403)
        .json({ success: false, message: "无权修改该订单" });
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      req.params.id,
      { status, updateTime: new Date() },
      { new: true },
    );

    return res.json({
      success: true,
      message: "订单状态已更新",
      data: updatedOrder,
    });
  } catch (error: unknown) {
    console.error("更新订单状态失败:", error);
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error) });
  }
}

export async function getAdminOrderList(req: Request, res: Response) {
  try {
    const { status } = req.query;
    const query = buildOrderQuery({ status });
    const orders = await OrderModel.find(query).sort({ createTime: -1 });
    return res.json({ success: true, data: orders });
  } catch (error: unknown) {
    console.error("管理员获取订单列表失败:", error);
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error) });
  }
}

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const orderData = buildCreateOrderPayload(req.body || {}, req.user?.userId);
    const order = new OrderModel(orderData);
    const savedOrder = await order.save();
    return res.status(201).json({ success: true, data: savedOrder });
  } catch (error: unknown) {
    return res
      .status(500)
      .json({ success: false, message: getErrorMessage(error) });
  }
}
