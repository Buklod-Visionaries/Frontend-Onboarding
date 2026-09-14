import express from "express";
import {
  getAllEmpReq,
  getOwnEmpReq,
  getSpecificEmpReq,
  getDepEmpReq,
  getSpecificDepEmpReq,
  editEmpReq,
  deleteSpecificEmpReq,
} from "../controllers/empReqController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";

const router = express.Router();

//get all employeeRequirements for HR
router.get("/", verifyToken, authorizeRoles("hr"), asyncHandler(getAllEmpReq));
//get users own requirements
router.get(
  "/me",
  verifyToken,
  authorizeRoles("employee"),
  asyncHandler(getOwnEmpReq),
);
//get dep reps all employee requirements
router.get(
  "/department",
  verifyToken,
  authorizeRoles("dept-rep"),
  asyncHandler(getDepEmpReq),
);
//
router.get(
  "/department/:id",
  verifyToken,
  authorizeRoles("dept-rep"),
  asyncHandler(getSpecificDepEmpReq),
);
//for authorized roles marking employee requirements completion
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("hr", "dept-rep"),
  asyncHandler(editEmpReq),
);
//get specific emp req
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getSpecificEmpReq),
);
//delete specific emp req
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteSpecificEmpReq),
);
export default router;
