-- Schema ban đầu cho fanpage-team (HTCode).
--
-- Gồm hai nhóm bảng:
--   1. Nội dung site: services, engagement_models, budget_ranges, timelines,
--      industries, process_steps, faqs, projects.
--   2. Dữ liệu người dùng gửi lên: briefs, brief_services.
--
-- Nội dung hai ngôn ngữ (vi, en) lưu trong cột jsonb dạng {"vi": ..., "en": ...}.
-- Bảo mật: bật RLS và KHÔNG tạo policy nào, nên chỉ backend (service role) truy cập được.

-- ---------------------------------------------------------------------------
-- Hàm dùng chung
-- ---------------------------------------------------------------------------

-- Kiểm tra giá trị jsonb có đủ hai ngôn ngữ vi và en.
create function public.is_i18n(value jsonb) returns boolean
language sql immutable
as $$
  select jsonb_typeof(value) = 'object' and value ? 'vi' and value ? 'en'
$$;

-- Tự cập nhật cột updated_at mỗi khi sửa dòng.
create function public.set_updated_at() returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- ---------------------------------------------------------------------------
-- Bảng tra cứu (khóa chữ ổn định, dùng trong form brief và nội dung)
-- ---------------------------------------------------------------------------

create table public.services (
  key         text primary key,
  sort_order  smallint not null,
  icon        text not null,
  title       jsonb not null check (public.is_i18n(title)),
  description jsonb not null check (public.is_i18n(description))
);

create table public.engagement_models (
  key         text primary key,
  sort_order  smallint not null,
  is_featured boolean not null default false,
  situation   jsonb not null check (public.is_i18n(situation)),
  title       jsonb not null check (public.is_i18n(title)),
  description jsonb not null check (public.is_i18n(description)),
  points      jsonb not null check (public.is_i18n(points))
);

create table public.budget_ranges (
  key        text primary key,
  sort_order smallint not null,
  label      jsonb not null check (public.is_i18n(label))
);

create table public.timelines (
  key        text primary key,
  sort_order smallint not null,
  label      jsonb not null check (public.is_i18n(label))
);

create table public.industries (
  key        text primary key,
  sort_order smallint not null,
  name       jsonb not null check (public.is_i18n(name))
);

-- ---------------------------------------------------------------------------
-- Nội dung trang chủ
-- ---------------------------------------------------------------------------

create table public.process_steps (
  key          text primary key,
  sort_order   smallint not null,
  title        jsonb not null check (public.is_i18n(title)),
  duration     jsonb not null check (public.is_i18n(duration)),
  description  jsonb not null check (public.is_i18n(description)),
  client_role  jsonb not null check (public.is_i18n(client_role)),
  deliverables jsonb not null check (public.is_i18n(deliverables))
);

create table public.faqs (
  id         bigint generated always as identity primary key,
  sort_order smallint not null,
  question   jsonb not null check (public.is_i18n(question)),
  answer     jsonb not null check (public.is_i18n(answer))
);

-- ---------------------------------------------------------------------------
-- Danh mục dự án
-- ---------------------------------------------------------------------------

create type public.project_type as enum ('web', 'mobile', 'ai');

create table public.projects (
  id             bigint generated always as identity primary key,
  type           public.project_type not null,
  industry_key   text not null references public.industries (key),
  service_key    text not null references public.services (key),
  is_featured    boolean not null default false,
  is_published   boolean not null default true,
  title          jsonb not null check (public.is_i18n(title)),
  summary        jsonb not null check (public.is_i18n(summary)),
  problem        jsonb not null check (public.is_i18n(problem)),
  solution       jsonb not null check (public.is_i18n(solution)),
  result         jsonb not null check (public.is_i18n(result)),
  duration_weeks smallint check (duration_weeks > 0),
  team_size      smallint check (team_size > 0),
  tech           text[] not null default '{}',
  -- Danh sách chỉ số: [{"label": {"vi": "...", "en": "..."}, "value": "..."}]
  kpis           jsonb not null default '[]' check (jsonb_typeof(kpis) = 'array'),
  -- Lời nhận xét khách hàng: {"quote": {vi,en}, "author": "...", "role": "...", "company": "..."}
  testimonial    jsonb check (testimonial is null or jsonb_typeof(testimonial) = 'object'),
  images         text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index projects_listing_idx on public.projects (is_published, is_featured desc, id);
create index projects_industry_key_idx on public.projects (industry_key);
create index projects_service_key_idx on public.projects (service_key);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Brief dự án do khách gửi từ form
-- ---------------------------------------------------------------------------

create table public.briefs (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  locale               text not null check (locale in ('vi', 'en')),
  name                 text not null check (char_length(btrim(name)) between 1 and 120),
  email                text not null check (char_length(email) <= 254 and email ~ '^\S+@\S+\.\S+$'),
  phone                text not null default '' check (char_length(phone) <= 40),
  message              text not null default '' check (char_length(message) <= 4000),
  -- null nghĩa là khách chọn "chưa chắc"
  engagement_model_key text references public.engagement_models (key),
  budget_key           text not null references public.budget_ranges (key),
  timeline_key         text not null references public.timelines (key),
  -- Trạng thái xử lý brief của đội ngũ
  status               text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed'))
);

create index briefs_created_at_idx on public.briefs (created_at desc);
create index briefs_status_idx on public.briefs (status);
create index briefs_engagement_model_key_idx on public.briefs (engagement_model_key);
create index briefs_budget_key_idx on public.briefs (budget_key);
create index briefs_timeline_key_idx on public.briefs (timeline_key);

create trigger briefs_set_updated_at
  before update on public.briefs
  for each row execute function public.set_updated_at();

-- Dịch vụ khách đã chọn trong brief (quan hệ nhiều-nhiều).
create table public.brief_services (
  brief_id    uuid not null references public.briefs (id) on delete cascade,
  service_key text not null references public.services (key),
  primary key (brief_id, service_key)
);

create index brief_services_service_key_idx on public.brief_services (service_key);

-- Lưu brief và các dịch vụ đã chọn trong một transaction.
create function public.submit_brief(
  p_locale           text,
  p_name             text,
  p_email            text,
  p_phone            text,
  p_message          text,
  p_engagement_model text,
  p_budget           text,
  p_timeline         text,
  p_services         text[]
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into briefs (locale, name, email, phone, message, engagement_model_key, budget_key, timeline_key)
  values (p_locale, p_name, p_email, p_phone, p_message, p_engagement_model, p_budget, p_timeline)
  returning id into v_id;

  insert into brief_services (brief_id, service_key)
  select v_id, service_key from (select distinct unnest(p_services) as service_key) s;

  return v_id;
end
$$;

-- ---------------------------------------------------------------------------
-- Phân quyền: bật RLS, không có policy, thu hồi quyền của anon/authenticated.
-- Backend dùng service role (bỏ qua RLS) nên vẫn truy cập bình thường.
-- ---------------------------------------------------------------------------

alter table public.services          enable row level security;
alter table public.engagement_models enable row level security;
alter table public.budget_ranges     enable row level security;
alter table public.timelines         enable row level security;
alter table public.industries        enable row level security;
alter table public.process_steps     enable row level security;
alter table public.faqs              enable row level security;
alter table public.projects          enable row level security;
alter table public.briefs            enable row level security;
alter table public.brief_services    enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
-- Chỉ revoke riêng submit_brief: is_i18n được các CHECK constraint gọi nên phải giữ quyền thực thi.
revoke all on function public.submit_brief(text, text, text, text, text, text, text, text, text[]) from public, anon, authenticated;
grant execute on function public.submit_brief(text, text, text, text, text, text, text, text, text[]) to service_role;
