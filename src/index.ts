import express from "express";
import { Request, Response, Express } from "express";
import authRouter from "./routes/auth";
import coursesRouter from "./routes/courses";
import videosRouter from "./routes/videos";
import adminRouter from "./routes/admin";
import prisma from "./db";
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to enable CORS
app.use(cors());

// Root route to get all users
app.get("/", async (req: Request, res: Response) => {
  try {
    const allUsers = await prisma.user.findMany();
    res.send(allUsers);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch users" });
  }
});

// Authentication routes
app.use("/auth", authRouter);
// Courses routes
app.use("/courses", coursesRouter);
// Videos/content routes
app.use("/content", videosRouter);
// Admin routes
app.use("/admin", adminRouter);

// Start the server
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
