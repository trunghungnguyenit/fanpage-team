-- Danh sách tài khoản được vào trang quản trị (đăng nhập bằng Google).
--
-- Backend đối chiếu email Google đã đăng nhập với bảng này ở mỗi request:
--   * email không có trong bảng, hoặc is_active = false  -> bị từ chối
--   * role = 'admin'  : toàn quyền, kể cả xóa dữ liệu và quản lý chính bảng này
--   * role = 'editor' : thêm/sửa nội dung, xem brief, đổi trạng thái/ghi chú brief; KHÔNG xóa và KHÔNG quản lý tài khoản
--
-- Bảng bật RLS và không có policy nào: chỉ backend (service role) đọc ghi được.
-- File chạy lại được nhiều lần.

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
  name text not null default '' check (char_length(name) <= 80),
  role text not null default 'editor' check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists admin_users_email_key on public.admin_users (email);

alter table public.admin_users enable row level security;

-- Tự cập nhật updated_at khi sửa dòng.
create or replace function public.admin_users_touch() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_touch on public.admin_users;
create trigger admin_users_touch before update on public.admin_users
for each row execute function public.admin_users_touch();

-- ADMIN ĐẦU TIÊN: thay email bên dưới bằng email Google của bạn rồi chạy file này.
-- Để nguyên giá trị mẫu thì không thêm gì. Sau khi đăng nhập được, thêm người khác ngay trên trang /admin.
do $$
declare
  first_admin text := 'hhuhnhg@gmail.com';
begin
  if first_admin <> 'EMAIL_CUA_BAN@gmail.com' then
    insert into public.admin_users (email, name, role)
    values (lower(btrim(first_admin)), 'Quản trị viên', 'admin')
    on conflict (email) do update set role = 'admin', is_active = true;
  end if;
end;
$$;
