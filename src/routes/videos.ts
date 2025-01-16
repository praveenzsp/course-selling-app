import express from "express";
import { Request, Response } from "express";
import authMiddleware from "../middlewares/user";
import { checkCourseAccess as contentAccessMiddleware } from "../middlewares/videoAccess";
import prisma from "../db";
import s3 from "../aws";

const router = express.Router();
router.use(express.json());

// Route to get a signed URL for a video
router.post(
  "/:courseId/:videoId",
  authMiddleware, // Middleware to check user authentication
  contentAccessMiddleware, // Middleware to check if the user has access to the course content
  async (req: Request, res: Response) => {
    const { courseId, videoId } = req.params;
    try {
      // Fetch video metadata from the database
      const videoMetadata = await prisma.video.findFirst({
        where: {
          courseId: parseInt(courseId),
          id: parseInt(videoId),
        },
      });

      // If video metadata is not found, return a 404 error
      if (!videoMetadata) {
        res.status(404).json({ error: "Video not found" });
        return;
      }

      // Parameters for generating the signed URL
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: videoMetadata.name || "demo5.mp4", // Use video name from metadata or a default value
        Expires: 60 * 15, // URL expiration time in seconds (15 minutes)
      };

      // Generate the signed URL
      const signedUrl = await s3.getSignedUrlPromise("getObject", params);

      // Return the video metadata along with the signed URL
      res.status(200).json({ ...videoMetadata, signedUrl });
    } catch (err) {
      // Handle any errors that occur during the process
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default router;
