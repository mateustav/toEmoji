import express, { type NextFunction } from "express";
const router = express.Router();

/* GET home page. */
router.get("/", function (_req, res, _next: NextFunction) {
  res.render("index", { title: "Express" });
});

export default router;
