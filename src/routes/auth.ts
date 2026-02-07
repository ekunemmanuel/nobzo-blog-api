import { Router } from "express";
import { register, login, logout } from "../controllers/auth";
import { validate } from "../middleware/error";
import { authMiddleware } from "../middleware/auth";
import { registerSchema, loginSchema } from "../validators/auth";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", authMiddleware, logout);

export default router;
