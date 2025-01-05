import express, { Request, Response } from "express";
import prisma from "../db";
import bcrypt from "bcrypt";
import { userSchema } from "../types";
import jwt from "jsonwebtoken";

const router = express.Router();
router.use(express.json());

router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, username } = req.body;
  // console.log(email, password, username);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    res.status(400).json({ error: "User already exists" });
    return;
  }

  const result = userSchema.safeParse({ email, password, username });
  if (result.success) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          username,
        },
      });
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      res.status(500).json({ error: "Error creating user" });
    }
  } else {
    res.status(400).json({ error: result.error.errors });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = userSchema.safeParse({ email, password });
  if (result.success) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({ error: "Password is incorrect" });
        return;
      }
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET!);
      res.status(200).json({ message: "Signin successful", token });
    } catch (error) {
      res.status(500).json({ error: "Error signing in" });
    }
  } else {
    res.status(400).json({ error: result.error.errors });
  }
});


export default router;
