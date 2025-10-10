import express from "express";
const router = express.Router();

router.post("/", ({ body }, res) => {
  const { text } = body;
  if (!text) {
    return res.status(400).json({ error: "Message is required" });
  }

  res.status(201).json({ status: "Message received", text });
});

export default router;
