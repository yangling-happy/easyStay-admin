import type { NextFunction, Request, Response } from "express";
import { logger } from "../services/logger.js";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `接口不存在: ${req.method} ${req.originalUrl}`,
  });
}

export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const appError =
    err instanceof AppError
      ? err
      : new AppError(
          err instanceof Error ? err.message : "服务器内部错误",
          500,
        );

  logger.error("全局异常捕获", {
    method: req.method,
    path: req.originalUrl,
    message: appError.message,
    statusCode: appError.statusCode,
    details: appError.details,
    stack: err instanceof Error ? err.stack : undefined,
  });

  res.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    details: appError.details,
  });
}
