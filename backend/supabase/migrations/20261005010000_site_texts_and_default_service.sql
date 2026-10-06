-- Đưa toàn bộ chữ giao diện vào database để frontend không còn đọc nội dung từ file JSON.
--
--   1. site_texts: chữ giao diện dạng khóa -> {"vi": ..., "en": ...}. Giá trị có thể là chuỗi,
--      mảng chuỗi hoặc object (ví dụ khối "why", nhóm "ui").
--   2. engagement_models.default_service_key: dịch vụ được chọn sẵn trong form brief
--      khi khách bấm chọn hình thức hợp tác đó.
--
-- File này chạy lại được nhiều lần. Sau khi chạy, chạy seed.sql để nạp nội dung.

create table if not exists public.site_texts (
  key   text primary key,
  value jsonb not null check (public.is_i18n(value))
);

alter table public.site_texts enable row level security;
revoke all on public.site_texts from anon, authenticated;

alter table public.engagement_models
  add column if not exists default_service_key text references public.services (key);

create index if not exists engagement_models_default_service_key_idx
  on public.engagement_models (default_service_key);
