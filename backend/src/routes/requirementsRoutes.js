import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getAllRequirements,
  addRequirement,
  getSpecificRequirement,
  updateRequirement,
  deleteRequirement,
} from "../controllers/requirementController.js";
// global error handler
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getAllRequirements),
);
router.post(
  "/",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(addRequirement),
);
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getSpecificRequirement),
);
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(updateRequirement),
);
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteRequirement),
);

export default router;
