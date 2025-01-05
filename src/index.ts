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

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  const allUsers = prisma.user.findMany();
  res.send(allUsers);
});

app.use("/auth", authRouter);
app.use("/courses", coursesRouter);
app.use("/content", videosRouter);
app.use("/admin", adminRouter);

app.listen(port, () => {
  console.log("Server is running on port "+port);
});
