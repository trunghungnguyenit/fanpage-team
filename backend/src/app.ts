import cors from "cors";
import express from "express";
import { adminRouter } from "./admin/index.js";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { briefRouter } from "./routes/brief.js";
import { contentRouter } from "./routes/content.js";
import { healthRouter } from "./routes/health.js";
import { projectsRouter } from "./routes/projects.js";

/** Tạo ứng dụng Express (tách khỏi việc listen để dễ kiểm thử). */
export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: "32kb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/brief", briefRouter);
  app.use("/api/content", contentRouter);
  app.use("/api/projects", projectsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
