import express from "express";
import type { Router } from "express";
import {
  uploadHotelImages,
  uploadMultipleImages,
  uploadRoomTypeImages,
  uploadSingleImage,
} from "../controllers/uploadController.js";
import { ensureUploadDirs, upload } from "../services/uploadService.js";

const router: Router = express.Router();

ensureUploadDirs();

router.post("/hotel", upload.array("images", 8), uploadHotelImages);
router.post("/room-type", upload.array("images", 5), uploadRoomTypeImages);
router.post("/single", upload.single("image"), uploadSingleImage);
router.post("/multiple", upload.array("images", 10), uploadMultipleImages);

export default router;
