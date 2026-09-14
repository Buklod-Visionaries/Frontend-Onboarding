import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getAllUser,
  getOwnUser,
  getSpecificUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
//
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
const router = express.Router();

//get all users
router.get("/", verifyToken, authorizeRoles("hr"), asyncHandler(getAllUser));

//get own account
router.get("/me", verifyToken, asyncHandler(getOwnUser));

//get specific user
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(getSpecificUser),
);
//
router.put("/:id", verifyToken, authorizeRoles("hr"), asyncHandler(updateUser));

//change user pass

//delete user
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(deleteUser),
);

export default router;
