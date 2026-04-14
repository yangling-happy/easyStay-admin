import express from "express";
import type { Router } from "express";
import {
  changePassword,
  getMe,
  login,
  register,
  updateMe,
} from "../controllers/authController.js";
const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);
router.put("/me", updateMe);
router.put("/password", changePassword);

export default router;
