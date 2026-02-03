import adminRoutes from './routes/adminRoutes.js';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import hotelRoutes from "./routes/hotelRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import fs from "fs";
dotenv.config();

// ES Module 兼容的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(cors());
// 解析请求体
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const publicDir = path.join(__dirname, "../public");
console.log("静态文件目录:", publicDir);

// 提供 /uploads 路径的静态文件访问
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

//添加酒店路由
//app.use('/api/hotels', hotelRoutes);
// 添加上传路由
//app.use('/api/upload', uploadRoutes);

app.use('/api/admin', adminRoutes); 
// 添加酒店路由
app.use("/api/hotels", hotelRoutes);
// 添加上传路由
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
  console.log(`上传目录: ${uploadsDir}`);
  console.log(`静态文件访问: http://localhost:${PORT}/uploads/`);
});
