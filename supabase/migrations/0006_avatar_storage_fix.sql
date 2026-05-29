-- ============================================================
-- HotSpots Map — починка прав доступа к бакету аватаров.
-- Симптом: при загрузке аватара — "new row violates row-level
-- security policy". Причина: в проектах, где бакеты создавались
-- через дашборд, политики для бакета 'avatars' из 0001 не создались.
-- Этот скрипт идемпотентно (можно запускать повторно) восстанавливает
-- бакет и его политики. Запустить в Supabase → SQL Editor.
-- ============================================================

-- Бакет (публичный на чтение). on conflict — чтобы не падать, если уже есть.
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do update set public = true;

-- Пересоздаём политики начисто.
drop policy if exists "avatars read"       on storage.objects;
drop policy if exists "avatars upload"     on storage.objects;
drop policy if exists "avatars update own" on storage.objects;
drop policy if exists "avatars delete own" on storage.objects;

-- Читать аватары может кто угодно (бакет публичный).
create policy "avatars read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Загружать/менять/удалять — любой авторизованный пользователь
-- (роль 'authenticated' включает и гостевой анонимный вход).
create policy "avatars upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars');

create policy "avatars update own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars')
  with check (bucket_id = 'avatars');

create policy "avatars delete own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars');
