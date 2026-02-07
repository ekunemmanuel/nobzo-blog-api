import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { BlacklistedToken } from "../models/BlacklistedToken";
import { env } from "../config/env";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.token || req.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: "Access denied. No token provided." },
    });
  }

  const isBlacklisted = await BlacklistedToken.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({
      success: false,
      error: { message: "Token has been invalidated (Logged out). Please log in again." },
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { message: "Invalid or expired token" },
    });
  }
};
