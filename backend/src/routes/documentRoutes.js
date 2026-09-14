import express from "express";
import {
  getAllDocuments,
  submitDocument,
  getSpecificDocument,
  deleteSpecificDocument,
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
