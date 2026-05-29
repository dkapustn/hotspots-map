-- ============================================================
-- HotSpots Map — добавляем уровень видимости 'private' (Только я).
-- Было: 'public' | 'friends'. Стало: + 'private'.
-- Приватные метки видит ТОЛЬКО их автор (даже друзья — нет).
-- Запустить в Supabase → SQL Editor после 0001–0007.
-- ============================================================

-- Разрешаем новое значение в check-констрейнте.
alter table public.profiles drop constraint if exists profiles_spots_visibility_check;
alter table public.profiles
  add constraint profiles_spots_visibility_check
  check (spots_visibility in ('public', 'friends', 'private'));

-- Пересобираем политику чтения меток.
-- Метку видно если:
--   1) её создал ты сам, ИЛИ
--   2) автор = 'public', ИЛИ
--   3) автор = 'friends' И вы взаимно подписаны (друзья).
-- 'private' не попадает ни под (2), ни под (3) → видит только автор.
drop policy if exists "spots_read" on public.spots;

create policy "spots_read" on public.spots for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = spots.user_id and p.spots_visibility = 'public'
  )
  or (
    exists (
      select 1 from public.profiles p
      where p.id = spots.user_id and p.spots_visibility = 'friends'
    )
    and exists (
      select 1
      from public.follows a
      join public.follows b
        on a.follower_id = b.followee_id and a.followee_id = b.follower_id
      where a.follower_id = auth.uid() and a.followee_id = spots.user_id
    )
  )
);
