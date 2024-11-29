import { NextFunction, Request, Response } from "express";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
};

export default errorHandler;
