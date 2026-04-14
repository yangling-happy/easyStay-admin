import type { NextFunction, Request, Response } from "express";

export interface AdminAuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

export function requireAdmin(
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "无权限访问" });
  }
  next();
}
