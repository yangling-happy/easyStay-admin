import type { Request, Response } from "express";
import { mapUploadedFiles } from "../services/uploadService.js";

export function uploadHotelImages(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: "没有文件上传" });
  }

  return res.json({
    success: true,
    data: mapUploadedFiles(files, "hotels"),
  });
}

export function uploadRoomTypeImages(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: "没有文件上传" });
  }

  return res.json({
    success: true,
    data: mapUploadedFiles(files, "rooms"),
  });
}

export function uploadSingleImage(req: Request, res: Response) {
  if (!req.file) {
    return res.status(400).json({ error: "没有文件上传" });
  }

  return res.json({
    url: `/uploads/general/${req.file.filename}`,
    filename: req.file.filename,
  });
}

export function uploadMultipleImages(req: Request, res: Response) {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: "没有文件上传" });
  }

  return res.json({ files: mapUploadedFiles(files, "general") });
}
