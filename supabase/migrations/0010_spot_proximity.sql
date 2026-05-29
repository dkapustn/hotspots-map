-- ============================================================
-- HotSpots Map — запрет создания метки рядом с существующей.
-- Функция возвращает true, если в радиусе p_meters от точки уже есть
-- хотя бы одна метка. SECURITY DEFINER — чтобы учитывались ВСЕ метки
-- (в т.ч. чужие приватные), иначе можно было бы поставить новую метку
-- поверх скрытой. Возвращает только boolean, данных не раскрывает.
-- Запустить в Supabase → SQL Editor после 0001–0009.
-- ============================================================

create or replace function public.has_spot_within(
  p_lat double precision,
  p_lng double precision,
  p_meters double precision
) returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.spots s
    where
      -- быстрый bbox-префильтр (использует индекс по координатам)
      s.latitude between p_lat - (p_meters / 111320.0)
                     and p_lat + (p_meters / 111320.0)
      and s.longitude between p_lng - (p_meters / (111320.0 * greatest(cos(radians(p_lat)), 0.000001)))
                          and p_lng + (p_meters / (111320.0 * greatest(cos(radians(p_lat)), 0.000001)))
      -- точное расстояние по формуле гаверсинуса
      and 2 * 6371000 * asin(sqrt(
            power(sin(radians(s.latitude - p_lat) / 2), 2) +
            cos(radians(p_lat)) * cos(radians(s.latitude)) *
            power(sin(radians(s.longitude - p_lng) / 2), 2)
          )) <= p_meters
  );
$$;

grant execute on function public.has_spot_within(double precision, double precision, double precision)
  to anon, authenticated;
