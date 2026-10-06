import { Router } from "express";
import { createBrief, findInvalidOptions } from "../repositories/brief-repository.js";
import { briefSchema, collectFieldErrors } from "../schemas/brief.js";

export const briefRouter = Router();

briefRouter.post("/", async (req, res) => {
  const parsed = briefSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({ ok: false, errors: collectFieldErrors(parsed.error) });
    return;
  }

  const invalid = await findInvalidOptions(parsed.data);
  if (Object.keys(invalid).length > 0) {
    res.status(422).json({ ok: false, errors: invalid });
    return;
  }

  const id = await createBrief(parsed.data);
  // Chỉ log id để tránh ghi dữ liệu cá nhân vào log.
  console.info("[brief] đã lưu", { id });
  res.status(201).json({ ok: true, id });
});
