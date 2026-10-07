import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  asyncHandler(getAllNotifications)
);

router.post(
  "/",
  verifyToken,
  authorizeRoles("hr","dept-rep"),
  asyncHandler(createNotification)
);

router.get(
  "/:id", 
  verifyToken,
  asyncHandler(getNotificationById)
);

router.put(
  "/:id",
  verifyToken,
  asyncHandler(updateNotification)
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteNotification)
);

export default router;