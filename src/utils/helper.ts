import jwt from "jsonwebtoken";
import { User } from "../schemas/auth";

// Helper function to generate JWT token
export const generateToken = (user: User) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("INVALID SECRET");
  }
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
};
