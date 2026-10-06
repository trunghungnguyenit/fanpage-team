import { Router } from "express";
import { HttpError } from "../errors.js";
import { parseLocale } from "../i18n.js";
import { PROJECT_TYPES, getProject, listProjects } from "../repositories/project-repository.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res) => {
  const type = PROJECT_TYPES.find((t) => t === req.query.type);
  res.json(await listProjects(parseLocale(req.query.lang), type));
});

projectsRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, "Không tìm thấy dự án");

  const project = await getProject(id, parseLocale(req.query.lang));
  if (!project) throw new HttpError(404, "Không tìm thấy dự án");
  res.json(project);
});
