-- ============================================================
-- HotSpots Map — initial schema
-- Run this in the Supabase SQL Editor on a fresh project.
-- ============================================================

-- ── profiles (extension of auth.users) ──
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text,
  visit_radius_m int not null default 100,
  theme text not null default 'system',
  created_at timestamptz not null default now()
);

-- ── spots (map markers) ──
create table public.spots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 500),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  photo_path text not null,
  created_at timestamptz not null default now()
);
create index spots_geo_idx on public.spots (latitude, longitude);
create index spots_created_idx on public.spots (created_at desc);
create index spots_user_idx on public.spots (user_id);

-- ── visits ──
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  visited_at timestamptz not null default now(),
  unique (user_id, spot_id)
);
create index visits_user_idx on public.visits (user_id);
create index visits_spot_idx on public.visits (spot_id);

-- ── likes ──
create table public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);
create index likes_spot_idx on public.likes (spot_id);

-- ── comments ──
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  spot_id uuid not null references public.spots(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index comments_spot_idx on public.comments (spot_id, created_at desc);

-- ── spot_stats view (aggregated counters) ──
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
  coalesce(l.likes_count, 0) as likes_count,
  coalesce(v.visits_count, 0) as visits_count,
  coalesce(c.comments_count, 0) as comments_count
from public.spots s
left join (
  select spot_id, count(*)::int as likes_count from public.likes group by spot_id
) l on l.spot_id = s.id
left join (
  select spot_id, count(*)::int as visits_count from public.visits group by spot_id
) v on v.spot_id = s.id
left join (
  select spot_id, count(*)::int as comments_count from public.comments group by spot_id
) c on c.spot_id = s.id;

-- ── RLS ──
alter table public.profiles enable row level security;
alter table public.spots    enable row level security;
alter table public.visits   enable row level security;
alter table public.likes    enable row level security;
alter table public.comments enable row level security;

-- profiles: anyone can read; owner can update; insert handled by trigger
create policy "profiles_read"        on public.profiles for select using (true);
create policy "profiles_update_own"  on public.profiles for update using (auth.uid() = id);

-- spots: anyone can read; owner can insert / delete
create policy "spots_read"           on public.spots    for select using (true);
create policy "spots_insert_own"     on public.spots    for insert with check (auth.uid() = user_id);
create policy "spots_delete_own"     on public.spots    for delete using (auth.uid() = user_id);

-- visits
create policy "visits_read"          on public.visits   for select using (true);
create policy "visits_insert_own"    on public.visits   for insert with check (auth.uid() = user_id);
create policy "visits_delete_own"    on public.visits   for delete using (auth.uid() = user_id);

-- likes
create policy "likes_read"           on public.likes    for select using (true);
create policy "likes_insert_own"     on public.likes    for insert with check (auth.uid() = user_id);
create policy "likes_delete_own"     on public.likes    for delete using (auth.uid() = user_id);

-- comments
create policy "comments_read"        on public.comments for select using (true);
create policy "comments_insert_own"  on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_delete_own"  on public.comments for delete using (auth.uid() = user_id);

-- ── trigger: create profile row on signup ──
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_base text;
  v_username text;
  v_suffix int := 0;
begin
  v_base := coalesce(
    nullif(new.raw_user_meta_data->>'username', ''),
    nullif(split_part(new.email, '@', 1), ''),
    'user_' || substr(new.id::text, 1, 8)
  );
  -- sanitize: keep alphanumerics + underscore + dot
  v_base := regexp_replace(v_base, '[^a-zA-Z0-9_.]', '', 'g');
  if char_length(v_base) < 3 then
    v_base := 'user_' || substr(new.id::text, 1, 8);
  end if;
  v_username := v_base;
  while exists(select 1 from public.profiles where username = v_username) loop
    v_suffix := v_suffix + 1;
    v_username := v_base || v_suffix;
  end loop;

  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    v_username,
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Storage buckets (run separately in the Supabase dashboard, or via SQL):
--   1. Create bucket "spot-photos"  (Public: ON)
--   2. Create bucket "avatars"      (Public: ON)
--
-- Then run the policies below.
-- ============================================================

-- Storage policies for spot-photos: authenticated users can upload, anyone can read.
insert into storage.buckets (id, name, public)
  values ('spot-photos', 'spot-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "spot-photos read"
  on storage.objects for select using (bucket_id = 'spot-photos');
create policy "spot-photos upload"
  on storage.objects for insert
  with check (bucket_id = 'spot-photos' and auth.role() = 'authenticated');
create policy "spot-photos delete own"
  on storage.objects for delete
  using (bucket_id = 'spot-photos' and owner = auth.uid());

create policy "avatars read"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars upload"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "avatars update own"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());
create policy "avatars delete own"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());
