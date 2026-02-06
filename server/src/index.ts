import adminRoutes from "./routes/adminRoutes.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import hotelRoutes from "./routes/hotelRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import fs from "fs";

dotenv.config();

// ES Module 兼容的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// 1. CORS（最先）
app.use(cors());

// 2. JSON解析（必须在路由之前）
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const publicDir = path.join(__dirname, "../public");
console.log("静态文件目录:", publicDir);
// 在 JSON 解析之后，路由之前添加
app.use((req, res, next) => {
  console.log(`=== 请求日志 ===`);
  console.log(`时间: ${new Date().toISOString()}`);
  console.log(`方法: ${req.method}`);
  console.log(`路径: ${req.url}`);
  console.log(`Content-Type: ${req.headers['content-type']}`);
  console.log(`请求体:`, req.body);
  console.log(`=== 结束日志 ===\n`);
  next();
});
// 3. 静态文件中间件
app.use("/uploads", express.static(path.join(publicDir, "uploads")));

// 确保 uploads 目录及其子目录存在
const uploadsDir = path.join(publicDir, "uploads");
const subDirs = ["hotels", "rooms", "general"];

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

subDirs.forEach((subDir) => {
  const dirPath = path.join(uploadsDir, subDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// 数据库连接
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/easyStay";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// 基础路由测试
app.get("/health", (req, res) =>
  res.json({
    status: "ok",
    time: new Date(),
    uploadsDir: uploadsDir,
  }),
);

app.get("/test-upload/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, "hotels", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: "文件不存在",
      path: filePath,
      exists: fs.existsSync(filePath),
    });
  }
});

// 酒店图片列表预览查看
app.get("/api/uploads/list", (req, res) => {
  try {
    const result: any = {};

    subDirs.forEach((subDir) => {
      const dir = path.join(uploadsDir, subDir);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        result[subDir] = {
          count: files.length,
          files: files.slice(0, 5),
        };
      }
    });

    res.json({
      success: true,
      uploadsDir: uploadsDir,
      directories: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ✅ 关键：路由放在所有中间件之后
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notification", notificationRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 服务器启动: http://localhost:${PORT}`);
  console.log(`📁 上传目录: ${uploadsDir}`);
  console.log(`🖼️  静态文件: http://localhost:${PORT}/uploads/`);
  console.log(`🔐 认证接口: http://localhost:${PORT}/api/auth/register`);
});
