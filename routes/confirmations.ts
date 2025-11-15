import express from "express";
import { encrypt } from "services/encrypt";

const router = express.Router();

router.get("/", (_req, res) => {
  res.send("Confirmation route is working!");
});

export default router;
