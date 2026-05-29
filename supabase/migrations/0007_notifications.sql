-- ============================================================
-- HotSpots Map — уведомления.
-- Кто-то лайкнул / прокомментировал / посетил твою метку, либо
-- подписался на тебя → строка в notifications. Создаются триггерами
-- в БД (SECURITY DEFINER), поэтому работают независимо от того, как
-- именно произошло действие, и не требуют INSERT-политики для клиента.
-- Запустить в Supabase → SQL Editor после 0001–0006.
-- ============================================================

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade, -- получатель
  actor_id   uuid not null references public.profiles(id) on delete cascade, -- кто совершил действие
  type       text not null check (type in ('like', 'comment', 'visit', 'follow')),
  spot_id    uuid references public.spots(id) on delete cascade,             -- null для подписки
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx   on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where not read;

alter table public.notifications enable row level security;

-- Видеть и помечать прочитанными — только свои уведомления.
create policy "notifications_read_own"   on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- INSERT клиентам не разрешён — только через триггеры ниже.

-- ── helper: создать уведомление (игнорирует уведомления самому себе) ──
create or replace function public.create_notification(
  p_user_id uuid, p_actor_id uuid, p_type text, p_spot_id uuid
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_user_id is null or p_actor_id is null or p_user_id = p_actor_id then
    return;
  end if;
  insert into public.notifications (user_id, actor_id, type, spot_id)
  values (p_user_id, p_actor_id, p_type, p_spot_id);
end; $$;

-- ── триггеры на действия ──
create or replace function public.notify_on_like() returns trigger
language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  select user_id into owner from public.spots where id = NEW.spot_id;
  perform public.create_notification(owner, NEW.user_id, 'like', NEW.spot_id);
  return NEW;
end; $$;
create trigger trg_notify_like after insert on public.likes
  for each row execute function public.notify_on_like();

create or replace function public.notify_on_comment() returns trigger
language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  select user_id into owner from public.spots where id = NEW.spot_id;
  perform public.create_notification(owner, NEW.user_id, 'comment', NEW.spot_id);
  return NEW;
end; $$;
create trigger trg_notify_comment after insert on public.comments
  for each row execute function public.notify_on_comment();

create or replace function public.notify_on_visit() returns trigger
language plpgsql security definer set search_path = public as $$
declare owner uuid;
begin
  select user_id into owner from public.spots where id = NEW.spot_id;
  perform public.create_notification(owner, NEW.user_id, 'visit', NEW.spot_id);
  return NEW;
end; $$;
create trigger trg_notify_visit after insert on public.visits
  for each row execute function public.notify_on_visit();

create or replace function public.notify_on_follow() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.create_notification(NEW.followee_id, NEW.follower_id, 'follow', null);
  return NEW;
end; $$;
create trigger trg_notify_follow after insert on public.follows
  for each row execute function public.notify_on_follow();

-- Реалтайм — чтобы бейдж-счётчик обновлялся мгновенно.
alter publication supabase_realtime add table public.notifications;
