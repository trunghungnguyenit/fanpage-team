-- Ảnh bìa tự lấy từ website dự án (thẻ og:image của trang trong `projects.url`).
--
-- Backend tự điền ba cột này, bạn không cần sửa tay:
--   og_image            : đường dẫn ảnh tìm được (chỉ https), null nếu website không có
--   og_image_checked_at : lần cuối backend đã thử lấy ảnh
--   og_image_source     : url dùng cho lần lấy đó; đổi `url` của dự án thì ảnh được lấy lại
--
-- Ảnh nhập tay trong `projects.images` luôn được ưu tiên hơn ảnh tự lấy.
-- File chạy lại được nhiều lần.

alter table public.projects
  add column if not exists og_image text check (og_image is null or og_image ~ '^https://'),
  add column if not exists og_image_checked_at timestamptz,
  add column if not exists og_image_source text;
