-- ============================================================
-- HotSpots Map — follows / friendships
-- Запустить после 0001 и 0002.
-- ============================================================

create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followee_id uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

create index follows_follower_idx on public.follows (follower_id);
create index follows_followee_idx on public.follows (followee_id);

-- ── RLS ──
alter table public.follows enable row level security;

-- читать может кто угодно
create policy "follows_read" on public.follows for select using (true);

-- подписываться может только текущий пользователь от своего имени, И
-- он НЕ должен быть анонимным (Supabase кладёт is_anonymous в JWT)
create policy "follows_insert_own" on public.follows
  for insert
  with check (
    auth.uid() = follower_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

-- отписаться от своих подписок может только их владелец
create policy "follows_delete_own" on public.follows
  for delete using (auth.uid() = follower_id);

-- ── view для друзей (взаимные подписки) ──
-- Каждая пара друзей появляется ровно один раз с user1_id < user2_id.
create or replace view public.friendships as
  select distinct
    least(a.follower_id,  a.followee_id) as user1_id,
    greatest(a.follower_id, a.followee_id) as user2_id
  from public.follows a
  join public.follows b
    on a.follower_id = b.followee_id
   and a.followee_id = b.follower_id;
