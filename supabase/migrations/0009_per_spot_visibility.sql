-- ============================================================
-- HotSpots Map — видимость ПЕР-МЕТКА (вместо общей в профиле).
-- Теперь каждая метка хранит свой уровень: 'public' | 'friends' | 'private'.
-- Управление перенесено внутрь самой метки (меню «три точки» у владельца).
-- Запустить в Supabase → SQL Editor после 0001–0008.
-- ============================================================

-- 1) Колонка видимости у метки.
alter table public.spots
  add column if not exists visibility text not null default 'public'
  check (visibility in ('public', 'friends', 'private'));

-- 2) Переносим существующую настройку из профиля в каждую метку,
--    чтобы поведение не изменилось для уже созданных меток.
update public.spots s
set visibility = coalesce(p.spots_visibility, 'public')
from public.profiles p
where p.id = s.user_id
  and s.visibility = 'public';   -- только дефолтные, повторный запуск не перетрёт

create index if not exists spots_visibility_idx on public.spots (visibility);

-- 3) Пересобираем политику чтения — теперь по visibility самой метки.
--    Видно если: ты автор | метка public | (метка friends И вы друзья).
drop policy if exists "spots_read" on public.spots;

create policy "spots_read" on public.spots for select using (
  auth.uid() = user_id
  or visibility = 'public'
  or (
    visibility = 'friends'
    and exists (
      select 1
      from public.follows a
      join public.follows b
        on a.follower_id = b.followee_id and a.followee_id = b.follower_id
      where a.follower_id = auth.uid() and a.followee_id = spots.user_id
    )
  )
);

-- 4) ВАЖНО: view spot_stats по умолчанию выполняется с правами владельца
--    (обходит RLS) — иначе приватные/friends-метки утекали бы в «Рейтинг».
--    security_invoker (PG15+) заставляет view уважать RLS вызывающего.
--    Оборачиваем в DO, чтобы не упасть на старых версиях Postgres.
do $$
begin
  execute 'alter view public.spot_stats set (security_invoker = on)';
exception when others then
  raise notice 'security_invoker недоступен на этой версии Postgres — статистика непубличных меток может быть видна в рейтинге';
end $$;
