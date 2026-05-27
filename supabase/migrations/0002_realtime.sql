-- ============================================================
-- HotSpots Map — enable Realtime on spots table
-- Run after 0001_init.sql so the map auto-updates when others
-- create or delete spots.
-- ============================================================

alter publication supabase_realtime add table public.spots;
