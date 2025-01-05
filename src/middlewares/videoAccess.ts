import { Request, Response, NextFunction } from "express";
import prisma from "../db";

export const checkCourseAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  const { courseId } = req.params;

  if (!userId || !courseId) {
    res.status(400).json({ error: "userId and courseId are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        purchasedCourses: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const purchasedCourses = user.purchasedCourses.map(
      (course) => course.courseId
    );

    if (!purchasedCourses.includes(parseInt(courseId))) {
      res.status(403).json({ error: "You do not have access to this course" });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
