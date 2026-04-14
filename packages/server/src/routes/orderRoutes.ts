import express from "express";
import type { Router } from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getAdminOrderList,
  getOrderDetail,
  getOrderList,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router: Router = express.Router();

router.get("/list", auth, getOrderList);
router.get("/detail/:id", auth, getOrderDetail);
router.patch("/:id/status", auth, updateOrderStatus);
router.get("/admin/list", getAdminOrderList);
router.post("/", auth, createOrder);

export default router;
