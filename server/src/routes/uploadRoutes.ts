// server/src/routes/uploadRoutes.ts
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径（ES Module 兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 创建上传目录
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 根据请求类型决定存储目录
    let subDir = 'general';
    if (req.url.includes('hotel')) subDir = 'hotels';
    else if (req.url.includes('room')) subDir = 'rooms';
    
    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 所有需要的路由
router.post('/single', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件上传' });
  }
  
  const filePath = `/uploads/general/${req.file.filename}`;
  res.json({ url: filePath });
});

router.post('/multiple', upload.array('images', 10), (req, res) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: '没有文件上传' });
  }
  
  const filesData = files.map(file => ({
    url: `/uploads/general/${file.filename}`,
    filename: file.filename
  }));
  
  res.json({ files: filesData });
});

router.post('/hotel', upload.array('images', 8), (req, res) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: '没有文件上传' 
    });
  }
  
  const urls = files.map(file => ({
    url: `/uploads/hotels/${file.filename}`,
    filename: file.filename
  }));
  
  res.json({
    success: true,
    data: urls
  });
});

router.post('/room-type', upload.array('images', 5), (req, res) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: '没有文件上传' 
    });
  }
  
  const urls = files.map(file => ({
    url: `/uploads/rooms/${file.filename}`,
    filename: file.filename
  }));
  
  res.json({
    success: true,
    data: urls
  });
});

export default router;