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
const db_1 = __importDefault(require("../db"));
const user_1 = __importDefault(require("../middlewares/user"));
const router = express_1.default.Router();
router.use(express_1.default.json());
router.use(user_1.default);
// Route to get all courses
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allCourses = yield db_1.default.course.findMany();
        res.status(200).json(allCourses);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
// Route to get all purchased courses for a user
router.get("/purchased", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    const user = yield db_1.default.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            purchasedCourses: {
                include: {
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
}));
// Route to buy a course
router.post("/buyCourse", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
        res.status(400).json({ error: "userId and courseId are required" });
        return;
    }
    // Check if user already bought the course
    const user = yield db_1.default.user.findUnique({
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
    const purchasedCourses = user.purchasedCourses.map((course) => course.courseId);
    if (purchasedCourses.includes(parseInt(courseId))) {
        res.status(403).json({ error: "You already have access to this course" });
        return;
    }
    // If user has not bought the course, add the course to the user's purchased courses
    try {
        const boughtCourse = yield db_1.default.courseUser.create({
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
    }
    catch (error) {
        res.status(500).json({ error: "Course purchase failed" });
    }
}));
// Route to get a specific course by ID
router.get("/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    try {
        const course = yield db_1.default.course.findUnique({
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
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
