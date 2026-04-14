import express from "express";
import type { Router } from "express";
import {
  getNotificationDetail,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notificationController.js";

const router: Router = express.Router();
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationAsRead);
router.get("/:id", getNotificationDetail);
router.patch("/read-all", markAllNotificationsAsRead);

export default router;
