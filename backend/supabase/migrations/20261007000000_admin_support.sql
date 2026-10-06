-- Hỗ trợ trang quản trị (admin).
--
--   * briefs.internal_note: ghi chú nội bộ của đội ngũ cho từng brief (khách không thấy).
--   * Bucket Storage `images` ở chế độ public: nơi admin tải ảnh dự án lên.
--     Nếu bucket đã có sẵn nhưng đang private, file này chuyển nó sang public để trang web hiển thị được ảnh.
--
-- File chạy lại được nhiều lần.
--
-- Tài khoản được vào trang quản trị nằm ở bảng admin_users (xem migration 20261008000000_admin_users.sql).

alter table public.briefs
  add column if not exists internal_note text not null default '' check (char_length(internal_note) <= 2000);

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;
