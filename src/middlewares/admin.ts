import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
     res.status(401).json({ error: "No token provided" });
      return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      email: string;
      role: string;
    };

    if (decoded.role !== "ADMIN") {
       res.status(403).json({ error: "Access denied. Admin only." });
       return;
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
