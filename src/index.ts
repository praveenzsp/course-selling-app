import express from "express";
import { Request, Response } from "express";
import authRouter from "./routes/auth";
import prisma from "./db";
import cors from "cors";
const app = express();
const port=process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  const allUsers = prisma.user.findMany();
  res.send(allUsers);
});

app.use("/auth", authRouter);

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
