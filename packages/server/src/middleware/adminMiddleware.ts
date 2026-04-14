import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types/http.js";

export type AdminAuthRequest = AuthRequest;

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
