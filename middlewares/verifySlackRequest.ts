import crypto from "crypto";

import { NextFunction, Request, Response } from "express";

export default function verifySlackRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { SLACK_SIGNING_SECRET } = process.env;
  if (!SLACK_SIGNING_SECRET) {
    return res.status(500).send("Slack signing secret not configured");
  }

  const timestamp = req.headers["x-slack-request-timestamp"] as string;
  const slackSignature = req.headers["x-slack-signature"] as string;
  const version = slackSignature?.split("=")[0];

  if (!timestamp || !slackSignature) {
    return res.status(400).send("Missing Slack signature or timestamp");
  }

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp) < fiveMinutesAgo) {
    return res.status(400).send("Request timestamp is too old");
  }

  const sigBasestring = `${version}:${timestamp}:${req.rawBody}`;
  const hmac = crypto.createHmac("sha256", SLACK_SIGNING_SECRET);
  hmac.update(sigBasestring);
  const mySignature = `${version}=${hmac.digest("hex")}`;

  if (
    crypto.timingSafeEqual(
      Buffer.from(mySignature, "utf8"),
      Buffer.from(slackSignature, "utf8")
    )
  ) {
    return next();
  } else {
    return res.status(400).send("Invalid Slack signature");
  }
}
