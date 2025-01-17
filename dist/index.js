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
const auth_1 = __importDefault(require("./routes/auth"));
const courses_1 = __importDefault(require("./routes/courses"));
const videos_1 = __importDefault(require("./routes/videos"));
const admin_1 = __importDefault(require("./routes/admin"));
const db_1 = __importDefault(require("./db"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// Middleware to parse JSON bodies
app.use(express_1.default.json());
// Middleware to enable CORS
app.use((0, cors_1.default)());
// Root route to get all users
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allUsers = yield db_1.default.user.findMany();
        res.send(allUsers);
    }
    catch (error) {
        res.status(500).send({ error: "Failed to fetch users" });
    }
}));
// Authentication routes
app.use("/auth", auth_1.default);
// Courses routes
app.use("/courses", courses_1.default);
// Videos/content routes
app.use("/content", videos_1.default);
// Admin routes
app.use("/admin", admin_1.default);
// Start the server
app.listen(port, () => {
    console.log("Server is running on port " + port);
});
