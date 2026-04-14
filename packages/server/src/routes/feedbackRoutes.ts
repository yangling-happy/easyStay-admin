import { Router } from "express";
import {
  getFeedbackList,
  replyFeedback,
  submitFeedback,
} from "../controllers/feedbackController.js";

const router: Router = Router();

router.post("/", submitFeedback);
router.get("/list", getFeedbackList);
router.patch("/:id/reply", replyFeedback);

export default router;
