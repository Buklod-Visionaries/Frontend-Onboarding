import express from "express";

import {
  createHistory,
  getHistoryByEmployeeRequirement,
} from "../controllers/employeeRequirementHistoryController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, authorizeRoles("hr", "dept-rep"), createHistory);

router.get(
  "/employee-requirement/:id",
  verifyToken,
  authorizeRoles("hr", "dept-rep", "employee"),
  getHistoryByEmployeeRequirement,
);
export default router;
