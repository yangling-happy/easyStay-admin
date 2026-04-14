import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../../public/uploads");

export function ensureUploadDirs() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  ["hotels", "rooms", "general"].forEach((subDir) => {
    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let subDir = "general";

    if (req.originalUrl.includes("/hotel")) {
      subDir = "hotels";
    } else if (req.originalUrl.includes("/room-type")) {
      subDir = "rooms";
    }

    cb(null, path.join(uploadsDir, subDir));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export function mapUploadedFiles(
  files: Express.Multer.File[],
  scope: "hotels" | "rooms" | "general",
) {
  return files.map((file) => ({
    url: `/uploads/${scope}/${file.filename}`,
    filename: file.filename,
  }));
}
