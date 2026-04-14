import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { NotificationModel } from "../models/Notification.js";
import { logger } from "./logger.js";

export function getUserIdFromToken(req: Request): string | null {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId ? String(decoded.userId) : null;
    if (userId) {
      logger.debug("从 Token 解析 userId", { userId });
    }

    return userId;
  } catch (error) {
    logger.warn("解析 Token 失败", error);
    return null;
  }
}

export function buildNotificationQuery(params: {
  ownerId: string;
  type?: unknown;
  status?: unknown;
}) {
  const query: any = { ownerId: String(params.ownerId) };
  if (params.type) query.type = params.type;
  if (params.status) query.status = params.status;
  return query;
}

export function getPagination(query: Record<string, unknown>) {
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 20);
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

export function setNoCacheHeaders(res: Response) {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
}

export async function getUnreadNotificationCount(ownerId: string) {
  return NotificationModel.countDocuments({
    ownerId: String(ownerId),
    status: "unread",
  });
}
