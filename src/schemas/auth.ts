import z from "zod";

// Zod validation schemas
export const signupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "Password must contain at least 8 characters" }),
  username: z
    .string()
    .min(3, { message: "Username must contain at least 3 characters" }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}
