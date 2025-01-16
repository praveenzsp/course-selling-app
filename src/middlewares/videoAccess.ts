import { Request, Response, NextFunction } from "express";
import prisma from "../db";

/**
 * Middleware to check if a user has access to a specific course.
 * 
 * This middleware function checks if the user identified by `userId` in the request body
 * has access to the course identified by `courseId` in the request parameters. If the user
 * does not have access, an appropriate error response is sent.
 * 
 * @param req - The request object, containing `userId` in the body and `courseId` in the parameters.
 * @param res - The response object, used to send error responses if access is denied.
 * @param next - The next middleware function in the stack, called if access is granted.
 * 
 * @returns void
 * 
 * @throws {400} If `userId` or `courseId` is not provided in the request.
 * @throws {404} If the user is not found in the database.
 * @throws {403} If the user does not have access to the specified course.
 * @throws {500} If an internal server error occurs.
 */
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
