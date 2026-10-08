import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getAllUser,
  getOwnUser,
  getSpecificUser,
  updateOwnUserPassword,
  resetUserPassword,
  deleteUser,
  changeUserStatus,
} from "../controllers/userController.js";
//
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
const router = express.Router();

//get all users
router.get("/", verifyToken, authorizeRoles("hr"), asyncHandler(getAllUser));

//get own account
router.get("/me", verifyToken, asyncHandler(getOwnUser));
//update own user pass
router.post(
  "/me/update-password",
  verifyToken,
  asyncHandler(updateOwnUserPassword),
);

//get specific user
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getSpecificUser),
);

//delete user
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteUser),
);

//reset password for hr
router.patch(
  "/:id/reset-password",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(resetUserPassword),
);

//change users status
router.patch(
  "/:id/status",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(changeUserStatus),
);

export default router;
