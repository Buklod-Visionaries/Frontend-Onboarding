import express from "express";

import {
  createHistory,
  getHistoryByEmployeeRequirement,
} from "../controllers/employeeRequirementHistoryController.js";

import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createHistory);

router.get(
  "/employee-requirement/:id",
  verifyToken,
  getHistoryByEmployeeRequirement,
);
export default router;
