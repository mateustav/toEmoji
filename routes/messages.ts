import express from "express";

import { transformMessage } from "services/transform";
const router = express.Router();

router.post("/", ({ body }, res) => {
  const { text } = body;

  if (!text) {
    return res.status(400).json({ error: "Message is required" });
  }

  res.status(200).end();

  const transformedText = transformMessage(text);

  const responseUrl = body.response_url;
  if (responseUrl) {
    fetch(responseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: transformedText }),
    }).catch((err) => {
      console.error("Error sending async response to Slack:", err);
    });
  }
});

export default router;
