import { createApp } from "./app.js";
import { config } from "./config.js";

createApp().listen(config.port, () => {
  console.info(`API đang chạy tại http://localhost:${config.port}`);
});
