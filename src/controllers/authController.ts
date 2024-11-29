import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { loginSchema, signupSchema } from "../schemas/auth";
import prisma from "../db/prisma";
import { generateToken } from "../utils/helper";
import { saltRounds } from "../config/constants";
import { ZodError } from "zod";

// User Registration
export const registerUser = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    // Validate request body using Zod
    const validatedData = signupSchema.parse(req.body);

    const { email, password, username } = validatedData;

    // Check if user or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      res.status(409).json({ message: "Username or email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
    });

    res.status(201).json({ message: "User successfully registered" });
    return;
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error(error.errors || error.message);
      res.status(400).json({
        message: "Invalid Inputs",
        error: error.errors.map((error) => error.message),
      });
    } else {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
    return;
  }
};

// User Login
export const loginUser = async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod
    const validatedData = loginSchema.parse(req.body);

    const { email, password } = validatedData;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set JWT token as HttpOnly cookie
    res.cookie("access-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure flag in production
      sameSite: "strict",
    });

    res.status(200).json({
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
    return;
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof ZodError) {
      res
        .status(400)
        .json({ message: "Error during login", error: error.message });
    } else {
      res.status(500).json({
        message: "Error during login",
        error: "Intrenal Server Error",
      });
    }
    return;
  }
};
