import express from "express";
import {
  getAllEmpReq,
  getOwnEmpReq,
  getSpecificEmpReq,
  getDepEmpReq,
  getSpecificDepEmpReq,
  editEmpReq,
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
//for dep rep edit employee requirements
router.put(
  "/department/:id",
  verifyToken,
  authorizeRoles("dept-rep"),
  asyncHandler(editEmpReq),
);
//get specific emp req
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getSpecificEmpReq),
);
export default router;
