import { Router, Request, Response, NextFunction } from "express";
import {
  createPost,
  getPosts,
  getPostBySlug,
  updatePost,
  deletePost,
} from "../controllers/posts";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/error";
import {
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
  getPostBySlugSchema,
  paramsIdSchema,
} from "../validators/posts";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { BlacklistedToken } from "../models/BlacklistedToken";

const router = Router();

const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.get("authorization")?.replace("Bearer ", "");
  if (token) {
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (!isBlacklisted) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
          id: string;
          email: string;
        };
        req.user = decoded;
      } catch (err) {
        // Ignore invalid token for optional auth
      }
    }
  }
  next();
};

router.post("/", authMiddleware, validate(createPostSchema), createPost);
router.get("/", optionalAuth, validate(getPostsSchema), getPosts);
router.get("/:slug", validate(getPostBySlugSchema), getPostBySlug);
router.put("/:id", authMiddleware, validate(updatePostSchema), updatePost);
router.delete("/:id", authMiddleware, validate(paramsIdSchema), deletePost);

export default router;
