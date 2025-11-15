import express from "express";
import pool from "db";
import { encrypt } from "services/encrypt";
import { OauthV2AccessResponse } from "@slack/web-api";

const router = express.Router();

async function getAccessResponse(code: string): Promise<OauthV2AccessResponse> {
  const basicAuth = Buffer.from(
    `${process.env.SLACK_CLIENT_ID}:${process.env.SLACK_SECRET}`
  ).toString("base64");
  const params = new URLSearchParams();
  params.append("code", code);

  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
    body: params.toString(),
  });

  const data = (await response.json()) as OauthV2AccessResponse;
  if (!data.ok) {
    throw new Error(`Slack OAuth failed: ${data.error}`);
  }

  if (!data.authed_user?.access_token || !data.access_token) {
    throw new Error("Missing access tokens in Slack response");
  }

  return data;
}

async function saveWorkspaceData(teamId: string, teamName: string) {
  const dbPool = await pool();
  const client = await dbPool.connect();
  try {
    await client.query(
      `INSERT INTO workspaces (name, external_id) VALUES ($1, $2) ON CONFLICT (external_id) DO NOTHING`,
      [teamName, teamId]
    );
  } finally {
    client.release();
  }
}

router.get("/", async (req, res) => {
  const { code } = req.query;

  if (typeof code !== "string") {
    return res.status(400).send("Missing or invalid code parameter");
  }

  try {
    const data = await getAccessResponse(code);
    await saveWorkspaceData(data.team!.id!, data.team!.name!);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(errorMessage);
  }

  res.send("Confirmation route is working");
});

export default router;
