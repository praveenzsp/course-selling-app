import express, { Request, Response } from "express";
import prisma from "../db";
import authMiddleware from "../middlewares/user";

const router = express.Router();
router.use(express.json());
router.use(authMiddleware);

// Route to get all courses
router.get("/", async (req: Request, res: Response) => {
  try {
    const allCourses = await prisma.course.findMany();
    res.status(200).json(allCourses);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get all purchased courses for a user
router.get("/purchased", async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      purchasedCourses: {
        include:{
          course: true
        }
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json(user.purchasedCourses);
});

// Route to buy a course
router.post("/buyCourse", async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    res.status(400).json({ error: "userId and courseId are required" });
    return;
  }

  // Check if user already bought the course
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
  if (purchasedCourses.includes(parseInt(courseId))) {
    res.status(403).json({ error: "You already have access to this course" });
    return;
  }
  // If user has not bought the course, add the course to the user's purchased courses
  try {
    const boughtCourse = await prisma.courseUser.create({
      data: {
        userId: userId,
        courseId: courseId,
      },
      include: {
        course: true,
      },
    });
    res.status(200).json({
      message: "Course purchased successfully",
      course: boughtCourse.course,
    });
  } catch (error) {
    res.status(500).json({ error: "Course purchase failed" });
  }
});

// Route to get a specific course by ID
router.get("/:courseId", async (req: Request, res: Response) => {
  const { courseId } = req.params;
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: parseInt(courseId),
      },
      include: {
        videos: true,
      },
    });
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
