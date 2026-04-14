import express from "express";
import type { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  batchDeleteHotels,
  createHotel,
  deleteHotel,
  getHotelDetail,
  getHotelsByOwnerId,
  getMerchantHotelRecords,
  getPublicHotelDetail,
  offlineHotel,
  onlineHotel,
  reApplyHotel,
  restoreHotel,
  updateHotel,
} from "../controllers/hotelController.js";

const router: Router = express.Router();

router.post("/", auth, createHotel);
router.get("/records", auth, getMerchantHotelRecords);
router.get("/owner/:ownerId", getHotelsByOwnerId);
router.get("/detail/:id", auth, getHotelDetail);
router.get("/public/:id", getPublicHotelDetail);
router.put("/:id", auth, updateHotel);
router.patch("/:id/offline", auth, offlineHotel);
router.patch("/:id/online", auth, onlineHotel);
router.post("/:id/re-apply", auth, reApplyHotel);
router.post("/restore", auth, restoreHotel);
router.delete("/:id", auth, deleteHotel);
router.post("/batch-delete", auth, batchDeleteHotels);

export default router;
