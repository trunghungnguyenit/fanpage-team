import { Router } from "express";

export const healthRouter = Router();

/** Dùng để kiểm tra server còn hoạt động. */
healthRouter.get("/", (_req, res) => {
  res.json({ status: "ok" });
});
