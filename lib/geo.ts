const EARTH_R_M = 6371000;

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R_M * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} м`;
  if (meters < 10000) return `${(meters / 1000).toFixed(1)} км`;
  return `${Math.round(meters / 1000)} км`;
}

export type Coords = { lat: number; lng: number; accuracy?: number };

export function getCurrentPosition(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Геолокация не поддерживается этим устройством"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(geolocationErrorMessage(err))),
      options,
    );
  });
}

function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Доступ к геолокации запрещён. Разрешите его в настройках браузера.";
    case err.POSITION_UNAVAILABLE:
      return "Не удалось определить ваше местоположение.";
    case err.TIMEOUT:
      return "Время ожидания геолокации истекло. Попробуйте ещё раз.";
    default:
      return "Ошибка геолокации.";
  }
}
