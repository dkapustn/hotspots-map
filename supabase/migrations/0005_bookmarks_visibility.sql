-- ============================================================
-- HotSpots Map — bookmarks (закладки) + spots_visibility (public/friends)
-- Запустить после 0001–0004.
-- ============================================================

-- ── Закладки (приватные, видит только владелец) ──
create table public.bookmarks (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  spot_id    uuid not null references public.spots(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

create index bookmarks_user_idx on public.bookmarks (user_id);

alter table public.bookmarks enable row level security;

-- Закладки приватные — никто не видит чужих, даже их количество.
create policy "bookmarks_read_own"   on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert_own" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete_own" on public.bookmarks for delete using (auth.uid() = user_id);

-- ── Видимость меток ──
alter table public.profiles
  add column if not exists spots_visibility text not null default 'public'
  check (spots_visibility in ('public', 'friends'));

-- ── Пересобираем spots_read с учётом видимости ──
-- Метку видно если:
--   1) её создал ты сам, ИЛИ
--   2) автор метки имеет spots_visibility = 'public', ИЛИ
--   3) ты и автор взаимно подписаны (друзья) — даже если visibility=friends
drop policy if exists "spots_read" on public.spots;

create policy "spots_read" on public.spots for select using (
  auth.uid() = user_id
  or exists (
    select 1 from public.profiles p
    where p.id = spots.user_id and p.spots_visibility = 'public'
  )
  or exists (
    select 1
    from public.follows a
    join public.follows b
      on a.follower_id = b.followee_id and a.followee_id = b.follower_id
    where a.follower_id = auth.uid() and a.followee_id = spots.user_id
  )
);
