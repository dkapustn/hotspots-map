-- ============================================================
-- HotSpots Map — ratings (5-звёздные оценки меток)
-- Запустить после 0001-0003.
-- ============================================================

create table public.ratings (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  spot_id    uuid not null references public.spots(id) on delete cascade,
  value      smallint not null check (value between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

create index ratings_spot_idx on public.ratings (spot_id);

-- ── RLS ──
alter table public.ratings enable row level security;

create policy "ratings_read"        on public.ratings for select using (true);
create policy "ratings_insert_own"  on public.ratings for insert with check (auth.uid() = user_id);
create policy "ratings_update_own"  on public.ratings for update using (auth.uid() = user_id);
create policy "ratings_delete_own"  on public.ratings for delete using (auth.uid() = user_id);

-- ── обновляем spot_stats view: добавляем avg_rating + ratings_count ──
drop view if exists public.spot_stats;

create or replace view public.spot_stats as
select
  s.id,
  s.user_id,
  s.title,
  s.description,
  s.latitude,
  s.longitude,
  s.photo_path,
  s.created_at,
  coalesce(l.likes_count, 0)         as likes_count,
  coalesce(v.visits_count, 0)        as visits_count,
  coalesce(c.comments_count, 0)      as comments_count,
  coalesce(r.ratings_count, 0)       as ratings_count,
  coalesce(r.avg_rating, 0)::numeric(3,2) as avg_rating
from public.spots s
left join (
  select spot_id, count(*)::int as likes_count from public.likes group by spot_id
) l on l.spot_id = s.id
left join (
  select spot_id, count(*)::int as visits_count from public.visits group by spot_id
) v on v.spot_id = s.id
left join (
  select spot_id, count(*)::int as comments_count from public.comments group by spot_id
) c on c.spot_id = s.id
left join (
  select spot_id, count(*)::int as ratings_count, avg(value)::numeric as avg_rating
  from public.ratings group by spot_id
) r on r.spot_id = s.id;

-- ── trigger: автоматом обновлять updated_at ──
create or replace function public.touch_rating_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger ratings_touch_updated_at
  before update on public.ratings
  for each row execute function public.touch_rating_updated_at();
