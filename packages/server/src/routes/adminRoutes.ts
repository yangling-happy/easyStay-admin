import express from "express";
import type { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  getOfflineHotels,
  getPendingHotels,
  getPublishedHotels,
  getRejectedHotels,
} from "../controllers/adminHotelQueryController.js";
import {
  submitHotelAudit,
  toggleHotelPublishStatus,
} from "../controllers/adminAuditController.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
/**
 * @description 路由
 */
const router: Router = express.Router();

router.get("/hotels/published", getPublishedHotels);

router.use(auth, requireAdmin);

router.get("/hotels/pending", getPendingHotels);
router.get("/hotels/rejected", getRejectedHotels);
router.get("/hotels/offline", getOfflineHotels);
router.post("/hotels/:id/audit", submitHotelAudit);
router.patch("/hotels/:id/toggle", toggleHotelPublishStatus);
/**
 * @description 导出路由
 */
export default router;
