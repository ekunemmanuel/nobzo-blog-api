import { Request, Response } from "express";
import { User } from "../models/User";
import { BlacklistedToken } from "../models/BlacklistedToken";
import { env } from "../config/env";
import { generateToken, catchAsync } from "../utils";
import { RegisterBody, LoginBody } from "../validators/auth";

export const register = catchAsync(
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id as unknown as string, user.email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: (user._id as any).toString(),
          name: user.name,
          email: user.email,
        },
      },
    });
  },
);

export const login = catchAsync(
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid credentials" },
      });
    }

    const token = generateToken(user._id as unknown as string, user.email);

    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: (user._id as any).toString(),
          name: user.name,
          email: user.email,
        },
      },
    });
  },
);

export const logout = catchAsync(async (req: Request, res: Response) => {
  const token =
    req.cookies?.token || req.get("authorization")?.replace("Bearer ", "");

  if (token) {
    // Save token to blacklist with an expiration (matching JWT 7d expiry)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await BlacklistedToken.create({ token, expiresAt });
  }

  res.clearCookie("token");
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});
