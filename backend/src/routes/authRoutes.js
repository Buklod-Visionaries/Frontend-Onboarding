import express from "express";
import {
  register,
  login,
  firstLogin,
  refresh,
  logout,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
//
import { asyncHandler } from "../middlewares/asyncHandlerMiddleware.js";
const router = express.Router();

//only HR can create accounts
router.post(
  "/register",
  verifyToken,
  authorizeRoles("hr"),
  asyncHandler(register),
);
router.post("/login", asyncHandler(login));
//for toggling first time login
router.post("/first-login", asyncHandler(firstLogin));
//update accesstoken using refreshtoken
router.post("/refresh", asyncHandler(refresh));
//logout
router.post("/logout", asyncHandler(logout));

export default router;
