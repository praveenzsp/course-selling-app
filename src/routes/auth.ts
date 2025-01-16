import express, { Request, Response } from "express";
import prisma from "../db";
import bcrypt from "bcrypt";
import { userSchema } from "../types";
import jwt from "jsonwebtoken";

const router = express.Router();
router.use(express.json());

// Route for user signup
router.post("/signup", async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  // Check if user already exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (user) {
    res.status(400).json({ error: "User already exists" });
    return;
  }

  // Validate user input using Zod schema
  const result = userSchema.safeParse({ email, password, username });
  if (result.success) {
    try {
      // Hash the password before storing it
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create new user in the database
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
    res.status(401).json({ error: result.error.errors });
  }
});

// Route for user signin
router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate user input using Zod schema
  const zodResult = userSchema.safeParse({ email, password });
  if (!zodResult.success) {
    res.status(400).json({ error: zodResult.error.errors });
    return;
  }
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Compare provided password with stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: "Password is incorrect" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!
    );

    res
      .status(200)
      .json({
        message: `${user.username} signed in successfully`,
        token,
        role: user.role,
        user: {username: user.username, email: user.email, userId: user.id},
      });
  } catch (error) {
    res.status(500).json({ error: "Error signing in" });
  }
});

export default router;
