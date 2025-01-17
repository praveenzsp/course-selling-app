"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../middlewares/user"));
const videoAccess_1 = require("../middlewares/videoAccess");
const db_1 = __importDefault(require("../db"));
const aws_1 = __importDefault(require("../aws"));
const router = express_1.default.Router();
router.use(express_1.default.json());
// Route to get a signed URL for a video
router.post("/:courseId/:videoId", user_1.default, // Middleware to check user authentication
videoAccess_1.checkCourseAccess, // Middleware to check if the user has access to the course content
(req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId, videoId } = req.params;
    try {
        // Fetch video metadata from the database
        const videoMetadata = yield db_1.default.video.findFirst({
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
        const signedUrl = yield aws_1.default.getSignedUrlPromise("getObject", params);
        // Return the video metadata along with the signed URL
        res.status(200).json(Object.assign(Object.assign({}, videoMetadata), { signedUrl }));
    }
    catch (err) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
