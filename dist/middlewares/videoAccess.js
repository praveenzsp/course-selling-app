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
exports.checkCourseAccess = void 0;
const db_1 = __importDefault(require("../db"));
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
const checkCourseAccess = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const { courseId } = req.params;
    if (!userId || !courseId) {
        res.status(400).json({ error: "userId and courseId are required" });
        return;
    }
    try {
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
        if (!purchasedCourses.includes(parseInt(courseId))) {
            res.status(403).json({ error: "You do not have access to this course" });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.checkCourseAccess = checkCourseAccess;
