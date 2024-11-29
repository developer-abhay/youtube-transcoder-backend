import { Router } from "express";
import { loginUser, registerUser } from "../controllers/authController";

export const authRouter = Router();

// User Registration Route
authRouter.post("/signup", registerUser);

// User Login Route
authRouter.post("/login", loginUser);
