import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Message is required" });
  }

  console.log("Received message:", text);
  res.status(201).json({ status: "Message received", text });
});

export default router;
