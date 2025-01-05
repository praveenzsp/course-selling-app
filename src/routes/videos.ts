import express from "express";
import { Request, Response, Express } from "express";
import authMiddleware from "../middlewares/user";
import {checkCourseAccess as contentAccessMiddleware} from "../middlewares/videoAccess";
import prisma from "../db";

const router = express.Router();

router.get(
  "/:courseId/:videoId",
  authMiddleware,
  contentAccessMiddleware,
  async (req: Request, res: Response) => {

    const { courseId, videoId } = req.params;
    const videoMetadata = await prisma.video.findFirst({
      where: {
        courseId: parseInt(courseId),
        id: parseInt(videoId),
      },
    });


    if (!videoMetadata) {
      res.status(404).json({ error: "Video not found" });
      return;
    }
    res.status(200).json(videoMetadata);
  }
);

export default router;
