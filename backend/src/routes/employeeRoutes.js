import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getAllEmployees,
  getOwnEmployee,
  getDepartmentEmployees,
  getDepSpecificEmployees,
  getSpecificEmployee,
  deleteSpecificEmployee,
  addEmployee,
  updateEmployee,
} from "../controllers/employeeController.js";
//
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";

const router = express.Router();

//for HR and dept Head get all onboarded employees
router.get(
  "/",
  verifyToken,
  authorizeRoles("hr", "dept-rep"),
  asyncHandler(getAllEmployees),
);
//adding employee (creates User then Employee)
router.post("/", verifyToken, authorizeRoles("hr"), asyncHandler(addEmployee));

//for employees get own data
router.get(
  "/me",
  verifyToken,
  authorizeRoles("employee"),
  asyncHandler(getOwnEmployee),
);

//Get all Department Employees for Dep Rep
router.get(
  "/department",
  verifyToken,
  authorizeRoles("dept-rep"),
  asyncHandler(getDepartmentEmployees),
);
//department specific emp
router.get(
  "/department/:id",
  verifyToken,
  authorizeRoles("dept-rep"),
  asyncHandler(getDepSpecificEmployees),
);

//for HR and depHead get specific employee
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hr", "dept-rep"),
  asyncHandler(getSpecificEmployee),
);

//updating employee onboarding
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(updateEmployee),
);

//deleting specific employee
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr", "dept-rep"),
  asyncHandler(deleteSpecificEmployee),
);

export default router;
