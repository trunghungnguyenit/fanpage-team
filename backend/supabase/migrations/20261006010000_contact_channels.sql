-- Kênh liên hệ hiển thị ở khối "Liên hệ" của trang chủ và menu mobile.
--
-- Mỗi dòng là một kênh. Chỉ kênh đã bật (is_published) và có `value` mới hiện ra,
-- nên 4 dòng mẫu bên dưới để trống cho bạn điền sau trong Table Editor:
--   value : chữ hiển thị trên thẻ, ví dụ hello@abc.com
--   url   : liên kết khi bấm, bắt đầu bằng https://, mailto: hoặc tel: (để trống thì thẻ không bấm được)
--   kind  : email | phone | zalo | messenger | other (quyết định icon)
--
-- Các dòng mẫu chỉ được tạo khi bảng còn trống, nên chạy lại file không ghi đè dữ liệu bạn đã điền.

create table if not exists public.contact_channels (
  id           bigint generated always as identity primary key,
  sort_order   smallint not null,
  kind         text not null check (kind in ('email', 'phone', 'zalo', 'messenger', 'other')),
  label        jsonb not null check (public.is_i18n(label)),
  value        text not null default '' check (char_length(value) <= 200),
  url          text not null default '' check (url = '' or url ~ '^(https?://|mailto:|tel:)'),
  is_published boolean not null default true
);

alter table public.contact_channels enable row level security;
revoke all on public.contact_channels from anon, authenticated;

insert into public.contact_channels (sort_order, kind, label)
select v.sort_order, v.kind, v.label::jsonb
from (values
  (1, 'email',     '{"vi":"Email","en":"Email"}'),
  (2, 'phone',     '{"vi":"Điện thoại","en":"Phone"}'),
  (3, 'zalo',      '{"vi":"Zalo","en":"Zalo"}'),
  (4, 'messenger', '{"vi":"Messenger","en":"Messenger"}')
) as v (sort_order, kind, label)
where not exists (select 1 from public.contact_channels);

-- Nhãn "Điện thoại" nay nằm trong contact_channels.
delete from public.site_texts where key = 'chPhone';
