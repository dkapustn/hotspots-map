-- ============================================================
-- HotSpots Map — гости (анонимный вход) только смотрят.
-- Запрещаем анонимам создавать метки / лайкать / посещать /
-- комментировать / оценивать / сохранять. Чтение остаётся открытым.
-- Проверка по JWT-флагу is_anonymous (как в follows из 0003).
-- Запустить в Supabase → SQL Editor после 0001–0010.
-- ============================================================

-- spots
drop policy if exists "spots_insert_own" on public.spots;
create policy "spots_insert_own" on public.spots for insert
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

-- visits
drop policy if exists "visits_insert_own" on public.visits;
create policy "visits_insert_own" on public.visits for insert
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

-- likes
drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes for insert
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

-- comments
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments for insert
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

-- ratings
drop policy if exists "ratings_insert_own" on public.ratings;
create policy "ratings_insert_own" on public.ratings for insert
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );

-- bookmarks
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks for insert
  with check (
    auth.uid() = user_id
    and not coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
  );
