import express from "express";
import { Request, Response } from "express";
import { adminMiddleware } from "../middlewares/admin";
import prisma from "../db";
import authMiddleware from "../middlewares/user";

const router = express.Router();

router.use(authMiddleware); // first check if user is logged in or not
router.use(adminMiddleware); // if logged in, check if user is admin or not. only then allow access to the below admin routes

// Route to add a new course
router.post("/add-course", async (req: Request, res: Response) => {
  const { name, description, price, rating, thumbnailUrl, discount } = req.body;

  try {
    // Validate required fields
    if (!name || !description || !price || !thumbnailUrl) {
      res.status(400).json({
        error: "Missing required fields",
      });
      return;
    }

    // Check if course already exists
    const existingCourse = await prisma.course.findFirst({
      where: {
        name,
        price: parseFloat(price),
      },
    });

    if (existingCourse) {
      res.status(400).json({
        error: "Course already exists",
      });
      return;
    }

    const newCourse = await prisma.course.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        rating: rating ? parseFloat(rating) : 0,
        thumbnailUrl,
        discount: discount ? parseFloat(discount) : 0,
      },
    });

    res.status(201).json({
      message: "Course added successfully",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      error: "Failed to create course",
    });
  }
});

// Route to update an existing course
router.put("/update-course/:id", async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id);
  const { name, description, price, rating, thumbnailUrl, discount } = req.body;

  try {
    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        name: name || existingCourse.name,
        description: description || existingCourse.description,
        price: price ? parseFloat(price) : existingCourse.price,
        rating: rating ? parseFloat(rating) : existingCourse.rating,
        thumbnailUrl: thumbnailUrl || existingCourse.thumbnailUrl,
        discount: discount ? parseFloat(discount) : existingCourse.discount,
      },
    });

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
});

// Route to delete a course
router.delete("/delete-course/:id", async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.id);

  try {
    // Verify course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: { videos: true },
    });

    if (!existingCourse) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Delete course (videos will be automatically deleted due to cascade)
    await prisma.course.delete({
      where: { id: courseId },
    });

    res.status(200).json({
      message: `Course named ${existingCourse.name} and ${existingCourse.videos.length} related videos deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// Route to get all courses
router.get("/all-courses", async (req: Request, res: Response) => {
  try {
    const allCourses = await prisma.course.findMany({
      include: { videos: true },
    });
    res.status(200).json(allCourses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Route to get all videos for a specific course
router.get("/videos/:courseId", async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId);
  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { videos: true },
    });
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
    res.status(200).json(course.videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// Route to add a new video to a specific course
router.post("/add-video/:courseId", async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId);
  const { name, url } = req.body;

  if (!name || !url) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    // Check if video already exists for this course
    const existingVideo = await prisma.video.findFirst({
      where: {
        name,
        courseId,
      },
    });

    if (existingVideo) {
      res.status(400).json({
        error: `Video with name ${existingVideo.name} already exists for this course`,
      });
      return;
    }

    // Create new video
    const newVideo = await prisma.video.create({
      data: {
        name,
        courseId,
      },
    });

    res.status(201).json({
      message: "Video added successfully to course",
      video: newVideo,
    });
  } catch (error) {
    console.error("Error adding video:", error);
    res.status(500).json({ error: "Failed to add video" });
  }
});

// route to update the video details for a specific course
router.put("/update-video/:videoId", async (req: Request, res: Response) => {
  const videoId = parseInt(req.params.videoId);
  const { name, url } = req.body;

  try {
    // Check if video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo) {
      res.status(404).json({ error: "Video not found" });
      return;
    }

    // Update video
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        name: name || existingVideo.name,
      },
    });

    res.status(200).json({
      message: "Video updated successfully",
      video: updatedVideo,
    });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
});

// Route to delete a video from a specific course
router.delete("/delete-video/:videoId", async (req: Request, res: Response) => {
  const videoId = parseInt(req.params.videoId);

  try {
    // Verify video exists
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!existingVideo) {
      res.status(404).json({ error: "Video not found" });
      return;
    }

    // Delete video
    await prisma.video.delete({
      where: { id: videoId },
    });

    res.status(200).json({
      message: `Video named ${existingVideo.name} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

export default router;
