import { Router } from "express";
import { parseLocale } from "../i18n.js";
import { getContent } from "../repositories/content-repository.js";

export const contentRouter = Router();

contentRouter.get("/", async (req, res) => {
  res.json(await getContent(parseLocale(req.query.lang)));
});
