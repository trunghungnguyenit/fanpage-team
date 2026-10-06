import { randomUUID } from "node:crypto";
import express, { Router } from "express";
import { getSupabase } from "../db/supabase.js";
import { AdminError } from "./errors.js";

const BUCKET = "images";
const MAX_BYTES = 5 * 1024 * 1024;

/** Định dạng ảnh cho phép, nhận diện bằng vài byte đầu của file (không tin vào phần mở rộng hay tên file). */
const FORMATS = [
  { mime: "image/png", ext: "png", matches: (b: Buffer) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
  { mime: "image/jpeg", ext: "jpg", matches: (b: Buffer) => b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) },
  { mime: "image/gif", ext: "gif", matches: (b: Buffer) => b.subarray(0, 4).toString("ascii") === "GIF8" },
  {
    mime: "image/webp",
    ext: "webp",
    matches: (b: Buffer) => b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP",
  },
];

export const uploadsRouter = Router();

// Ảnh gửi lên dạng nhị phân thô; Content-Type khác các loại ảnh bên dưới sẽ không được đọc và bị từ chối ở bước kiểm tra.
const rawImage = express.raw({ type: FORMATS.map((f) => f.mime), limit: MAX_BYTES });

uploadsRouter.post("/", rawImage, async (req, res) => {
  const body: unknown = req.body;
  if (!Buffer.isBuffer(body) || body.length === 0) throw new AdminError(415, "FILE_TYPE");

  const format = FORMATS.find((f) => f.mime === req.headers["content-type"] && f.matches(body));
  if (!format) throw new AdminError(415, "FILE_TYPE");

  const path = `projects/${randomUUID()}.${format.ext}`;
  const storage = getSupabase().storage.from(BUCKET);
  const { error } = await storage.upload(path, body, { contentType: format.mime, cacheControl: "31536000" });
  if (error) {
    if (/bucket not found/i.test(error.message)) throw new AdminError(503, "STORAGE_NOT_READY");
    throw new Error(`Không tải được ảnh lên Storage: ${error.message}`);
  }

  res.status(201).json({ url: storage.getPublicUrl(path).data.publicUrl });
});
