import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
// ES Module 兼容
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
// 上传目录
const uploadsDir = path.join(__dirname, "../../public/uploads");
// 确保目录存在
const ensureDirs = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    ["hotels", "rooms", "general"].forEach((subDir) => {
        const dir = path.join(uploadsDir, subDir);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};
ensureDirs();
// Multer 配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let subDir = "general";
        if (req.originalUrl.includes("/hotel")) {
            subDir = "hotels";
        }
        else if (req.originalUrl.includes("/room-type")) {
            subDir = "rooms";
        }
        const dir = path.join(uploadsDir, subDir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});
// 上传酒店图片
router.post("/hotel", upload.array("images", 8), (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "没有文件上传",
        });
    }
    const urls = files.map((file) => ({
        url: `/uploads/hotels/${file.filename}`,
        filename: file.filename,
    }));
    res.json({
        success: true,
        data: urls,
    });
});
// 上传房型图片
router.post("/room-type", upload.array("images", 5), (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "没有文件上传",
        });
    }
    const urls = files.map((file) => ({
        url: `/uploads/rooms/${file.filename}`,
        filename: file.filename,
    }));
    res.json({
        success: true,
        data: urls,
    });
});
// 单文件上传
router.post("/single", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "没有文件上传" });
    }
    res.json({
        url: `/uploads/general/${req.file.filename}`,
        filename: req.file.filename,
    });
});
// 多文件上传
router.post("/multiple", upload.array("images", 10), (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ error: "没有文件上传" });
    }
    const filesData = files.map((file) => ({
        url: `/uploads/general/${file.filename}`,
        filename: file.filename,
    }));
    res.json({ files: filesData });
});
export default router;
//# sourceMappingURL=uploadRoutes.js.map