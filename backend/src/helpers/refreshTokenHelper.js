import "dotenv/config";

import jwt from "jsonwebtoken";
import crypto from "crypto";

const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

if (!REFRESH_TOKEN_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not loaded from .env");
}

export const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export function createRefreshToken(userId) {
  return jwt.sign(
    {
      id: userId.toString(),
      tokenUse: "refresh",
      jti: crypto.randomUUID(),
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
      algorithm: "HS256",
    },
  );
}

export function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
