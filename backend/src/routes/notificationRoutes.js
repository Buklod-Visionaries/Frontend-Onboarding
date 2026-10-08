import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
import {
  createNotification,
  getAllNotifications,
  readAllOwnNotifications,
  deleteAllOwnNotifications,
  getAllOwnNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

//can be used to send reminder to employee
router.post(
  "/",
  verifyToken,
  authorizeRoles("hr", "dept-rep"),
  asyncHandler(createNotification),
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getAllNotifications),
); //all including from other users

router.get("/me", verifyToken, asyncHandler(getAllOwnNotifications)); // all own only

router.patch(
  "/me/read-all", //mark read all own notif
  verifyToken,
  asyncHandler(readAllOwnNotifications),
);

router.delete(
  "/me/delete-all", //mark read all own notif
  verifyToken,
  asyncHandler(deleteAllOwnNotifications),
);

router.get("/:id", verifyToken, asyncHandler(getNotificationById));

router.put("/:id", verifyToken, asyncHandler(updateNotification));

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteNotification),
);

export default router;
