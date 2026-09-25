import express from "express";
import {
  getAllDocuments,
  submitDocument,
  getEmpReqSpecificDocument,
  getSpecificDocument,
  deleteSpecificDocument,
  deleteSpecificDocByEmpReqId,
} from "../controllers/documentController.js";
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", asyncHandler(getAllDocuments));
//
router.post(
  "/",
  verifyToken,
  authorizeRoles("employee"),
  upload.single("file"),
  asyncHandler(submitDocument),
);
//get documents of specific empReq
router.get(
  "/employee-requirement/:id",
  verifyToken,
  authorizeRoles("hr", "employee"),
  asyncHandler(getEmpReqSpecificDocument),
);

//
//delete specific document using employeeRequirements id
router.delete(
  "/employee-requirement/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteSpecificDocByEmpReqId),
);

//get specific doc
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hr", "employee"),
  asyncHandler(getSpecificDocument),
);
//delete specific doc
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteSpecificDocument),
);

export default router;
