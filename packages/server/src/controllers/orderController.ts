import type { NextFunction, Request, Response } from "express";
import { OrderModel } from "../models/Order.js";
import {
  buildCreateOrderPayload,
  buildOrderQuery,
  getOwnerHotelIds,
  isValidOrderStatus,
} from "../services/orderService.js";
import type { AuthRequest } from "../types/http.js";
import { logger } from "../services/logger.js";
import { AppError } from "../middleware/errorMiddleware.js";

export async function getOrderList(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status, hotelId } = req.query;
    const hotelIds = await getOwnerHotelIds(req.user?.userId);

    if (hotelId && !hotelIds.includes(String(hotelId))) {
      return next(new AppError("无权访问该酒店的订单", 403));
    }

    const query = buildOrderQuery({
      status,
      hotelId: hotelId ? String(hotelId) : { $in: hotelIds },
    });

    const orders = await OrderModel.find(query).sort({ createTime: -1 });
    return res.json({ success: true, data: orders });
  } catch (error: unknown) {
    logger.error("获取订单列表失败", error);
    return next(error);
  }
}

export async function getOrderDetail(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return next(new AppError("未找到订单", 404));
    }

    const hotelIds = await getOwnerHotelIds(req.user?.userId);
    if (!hotelIds.includes(order.hotelId)) {
      return next(new AppError("无权访问该订单", 403));
    }

    return res.json({ success: true, data: order });
  } catch (error: unknown) {
    logger.error("获取订单详情失败", error);
    return next(error);
  }
}

export async function updateOrderStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.body as { status: string };
    if (!isValidOrderStatus(status)) {
      return next(new AppError("无效的订单状态", 400));
    }

    const order = await OrderModel.findById(req.params.id);
    if (!order) {
      return next(new AppError("未找到订单", 404));
    }

    const hotelIds = await getOwnerHotelIds(req.user?.userId);
    if (!hotelIds.includes(order.hotelId)) {
      return next(new AppError("无权修改该订单", 403));
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
    logger.error("更新订单状态失败", error);
    return next(error);
  }
}

export async function getAdminOrderList(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.query;
    const query = buildOrderQuery({ status });
    const orders = await OrderModel.find(query).sort({ createTime: -1 });
    return res.json({ success: true, data: orders });
  } catch (error: unknown) {
    logger.error("管理员获取订单列表失败", error);
    return next(error);
  }
}

export async function createOrder(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const orderData = buildCreateOrderPayload(req.body || {}, req.user?.userId);
    const order = new OrderModel(orderData);
    const savedOrder = await order.save();
    return res.status(201).json({ success: true, data: savedOrder });
  } catch (error: unknown) {
    return next(error);
  }
}
