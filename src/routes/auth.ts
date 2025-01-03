import express from "express";

const router = express.Router();

router.post("/signup", (req, res) => {
  res.send("Hello signup");
});

router.post("/signin", (req, res) => {
  res.send("Hello signin");
});

router.get("/profile", (req, res) => {
  res.send("Hello profile");
});

export default router;