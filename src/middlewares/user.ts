import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";

const jwtSecret = process.env.JWT_SECRET;

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // checks if the user is logged in or not by verifying the token
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    res.status(403).json({
      message: "You are not authenticated",
    });
    return;
  }
  try {
    const decodedValue = jwt.verify(token, jwtSecret as string);
    if ((decodedValue as jwt.JwtPayload).email) {
      next();
    } else {
      res.status(403).json({
        message: "You are not authenticated",
      });
    }
  } catch (e) {
    res.json({
      message: "Incorrect inputs",
    });
  }
};

export default authMiddleware;
