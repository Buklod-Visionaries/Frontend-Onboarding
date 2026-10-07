import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
import { generateReports } from "../controllers/reportController.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(generateReports),
);

export default router;
