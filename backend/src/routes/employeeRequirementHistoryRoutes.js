import express from "express";

import {
  createHistory,
  getAllEmpReqHistory,
  getHistoryByEmployeeRequirement,
} from "../controllers/employeeRequirementHistoryController.js";

import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizeRoles("hr", "dept-rep"),
  asyncHandler(createHistory),
);

router.get(
  "/",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getAllEmpReqHistory),
);

router.get(
  "/employee-requirement/:id",
  verifyToken,
  authorizeRoles("hr", "dept-rep", "employee"),
  asyncHandler(getHistoryByEmployeeRequirement),
);
export default router;
