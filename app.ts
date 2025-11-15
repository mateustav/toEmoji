import "dotenv/config";
import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import indexRouter from "./routes/index";
import confirmationsRouter from "./routes/confirmations";
import messagesRouter from "./routes/messages";

import verifySlackRequest from "middlewares/verifySlackRequest";

declare module "http" {
  interface IncomingMessage {
    rawBody?: string;
  }
}

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
    verify: (req, _res, buf, encoding: BufferEncoding) => {
      req.rawBody = buf.toString(encoding || "utf8");
    },
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/confirm", confirmationsRouter);
app.use("/messages", verifySlackRequest, messagesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (
  err: any,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
