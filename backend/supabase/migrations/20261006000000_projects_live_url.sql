-- Dự án giờ là các website đang chạy: thêm đường dẫn `url` và bỏ các trường mô tả dài.
--
--   * projects.url: địa chỉ website đang chạy (chỉ nhận http/https), để trống nếu chưa có.
--   * Xóa các cột problem, solution, result, duration_weeks, team_size, kpis, testimonial, industry_key
--     cùng bảng industries (chỉ projects dùng bảng này).
--   * Xóa các dòng site_texts không còn dùng.
--
-- CẢNH BÁO: các cột bị xóa sẽ mất dữ liệu. File chạy lại được nhiều lần.
-- Sau khi chạy, chạy lại seed.sql.

alter table public.projects
  add column if not exists url text check (url is null or url ~ '^https?://');

alter table public.projects
  drop column if exists problem,
  drop column if exists solution,
  drop column if exists result,
  drop column if exists duration_weeks,
  drop column if exists team_size,
  drop column if exists kpis,
  drop column if exists testimonial,
  drop column if exists industry_key;

drop table if exists public.industries;

delete from public.site_texts
where key in (
  'problem', 'solution', 'result', 'duration', 'teamSize', 'industryL', 'allInd',
  'related', 'unitWeeks', 'unitPeople', 'shot', 'phShot'
);
