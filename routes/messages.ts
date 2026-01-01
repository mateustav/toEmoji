import express from "express";
import pool from "db";
import { decrypt } from "services/encrypt";
import { transformMessage } from "services/transform";

import type { EmojiListResponse } from "@slack/web-api";
const router = express.Router();

async function fetchEmojisFromDB(teamId: string) {
  const dbPool = await pool();
  const client = await dbPool.connect();

  try {
    const result = await client.query(
      `SELECT emojis, bot_access_token_encrypted FROM workspaces WHERE external_id = $1`,
      [teamId]
    );
    if (result.rows[0].emojis && result.rows[0].emojis.length > 0) {
      return result.rows[0].emojis;
    }

    const { iv, content, tag } = result.rows[0].bot_access_token_encrypted;
    const token = decrypt(iv, content, tag);

    const slackEmojis = await fetch("https://slack.com/api/emoji.list", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ token }).toString(),
    });

    const emojisArray = (await slackEmojis.json()) as EmojiListResponse;
    if (emojisArray.ok && emojisArray.emoji) {
      const emojis = Object.keys(emojisArray.emoji);
      await client.query(
        `UPDATE workspaces SET emojis = $1 WHERE external_id = $2`,
        [emojis, teamId]
      );
      return emojis;
    } else {
      console.error("Error fetching emojis from Slack:", emojisArray.error);
      return [];
    }
  } finally {
    client.release();
  }
}

router.post("/", async ({ body }, res) => {
  const { text, team_id } = body;

  if (!text) {
    return res.status(400).json({ error: "Message is required" });
  }

  res.status(200).end();

  const customEmojis = await fetchEmojisFromDB(team_id);

  const transformedText = transformMessage(text, customEmojis);

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
