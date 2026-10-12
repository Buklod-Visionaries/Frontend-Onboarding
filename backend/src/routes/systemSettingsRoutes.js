import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getSystemSettings,
  updateSystemSettings,
} from "../controllers/systemSettingsController.js";

//
const router = express.Router();

//
router.get(
  "/",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getSystemSettings),
);

//updateSystemSettings
router.put(
  "/",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(updateSystemSettings),
);

export default router;
