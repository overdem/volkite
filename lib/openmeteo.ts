export interface WindData {
  speed: number;
  dir: string;
}

export interface DayForecast {
  date: string;
  avg_kn: number;
  max_gust_kn: number;
  dir: string;
  in_forecast: boolean;
}

export interface HourSlot {
  iso: string;          // "2026-06-30T10:00"
  date: string;         // "2026-06-30"
  hour: number;         // 10
  speed_kn: number;
  gust_kn: number;
  dir: string;
  in_trust_window: boolean; // 3 gün içi mi (güvenilir tahmin)
}

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const FORECAST_DAYS = 14;

function toCompass(deg: number): string {
  return DIRS[Math.round(deg / 45) % 8];
}

function avgDirection(dirs: number[]): number {
  if (dirs.length === 0) return 0;
  const sinSum = dirs.reduce((s, d) => s + Math.sin((d * Math.PI) / 180), 0);
  const cosSum = dirs.reduce((s, d) => s + Math.cos((d * Math.PI) / 180), 0);
  return ((Math.atan2(sinSum / dirs.length, cosSum / dirs.length) * 180) / Math.PI + 360) % 360;
}

export async function fetchWind(): Promise<WindData | null> {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=40.17&longitude=25.84&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=kn',
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const c = data?.current;
    if (typeof c?.wind_speed_10m !== 'number') return null;
    return {
      speed: Math.round(c.wind_speed_10m),
      dir: toCompass(c.wind_direction_10m ?? 0),
    };
  } catch {
    return null;
  }
}

// Kiting hours: 08:00–20:00 local Istanbul time
export async function fetchWindForecast(dateFrom: string, dateTo: string): Promise<DayForecast[]> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=40.17&longitude=25.84` +
      `&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
      `&wind_speed_unit=kn&forecast_days=${FORECAST_DAYS}&timezone=Europe/Istanbul`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();

    const times: string[] = data?.hourly?.time ?? [];
    const speeds: number[] = data?.hourly?.wind_speed_10m ?? [];
    const gusts: number[] = data?.hourly?.wind_gusts_10m ?? [];
    const dirs: number[] = data?.hourly?.wind_direction_10m ?? [];

    const byDay = new Map<string, { speeds: number[]; gusts: number[]; dirs: number[] }>();
    for (let i = 0; i < times.length; i++) {
      const dt = times[i]; // "2025-07-14T08:00"
      const date = dt.slice(0, 10);
      const hour = parseInt(dt.slice(11, 13), 10);
      if (hour < 8 || hour > 20) continue;
      if (!byDay.has(date)) byDay.set(date, { speeds: [], gusts: [], dirs: [] });
      const d = byDay.get(date)!;
      d.speeds.push(speeds[i]);
      d.gusts.push(gusts[i]);
      d.dirs.push(dirs[i]);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + FORECAST_DAYS);

    const results: DayForecast[] = [];
    const cur = new Date(dateFrom);
    const end = new Date(dateTo);
    while (cur <= end) {
      const dateStr = cur.toISOString().slice(0, 10);
      const dayData = byDay.get(dateStr);
      const inForecast = cur >= today && cur < cutoff;

      if (dayData && dayData.speeds.length > 0 && inForecast) {
        const avg = dayData.speeds.reduce((a, b) => a + b, 0) / dayData.speeds.length;
        const maxGust = Math.max(...dayData.gusts);
        results.push({
          date: dateStr,
          avg_kn: Math.round(avg * 10) / 10,
          max_gust_kn: Math.round(maxGust * 10) / 10,
          dir: toCompass(avgDirection(dayData.dirs)),
          in_forecast: true,
        });
      } else {
        results.push({ date: dateStr, avg_kn: 0, max_gust_kn: 0, dir: 'N/A', in_forecast: false });
      }

      cur.setDate(cur.getDate() + 1);
    }

    return results;
  } catch {
    return [];
  }
}

// Takvim için saatlik tahmin — 14 gün, 08:00–20:00 arası. 30 dk cache.
// İlk 3 gün "kesin" (in_trust_window=true), sonrası "tahmini eğilim".
export async function fetchHourlyForecast(): Promise<HourSlot[]> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=40.17&longitude=25.84` +
      `&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m` +
      `&wind_speed_unit=kn&forecast_days=${FORECAST_DAYS}&timezone=Europe/Istanbul`;

    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const data = await res.json();

    const times: string[] = data?.hourly?.time ?? [];
    const speeds: number[] = data?.hourly?.wind_speed_10m ?? [];
    const gusts: number[] = data?.hourly?.wind_gusts_10m ?? [];
    const dirs: number[] = data?.hourly?.wind_direction_10m ?? [];

    const now = new Date();
    const trustEnd = new Date(now);
    trustEnd.setDate(now.getDate() + 3);
    trustEnd.setHours(23, 59, 59, 999);

    const out: HourSlot[] = [];
    for (let i = 0; i < times.length; i++) {
      const iso = times[i];
      const hour = parseInt(iso.slice(11, 13), 10);
      if (hour < 8 || hour > 20) continue;
      const dt = new Date(iso);
      out.push({
        iso,
        date: iso.slice(0, 10),
        hour,
        speed_kn: Math.round((speeds[i] ?? 0) * 10) / 10,
        gust_kn: Math.round((gusts[i] ?? 0) * 10) / 10,
        dir: toCompass(dirs[i] ?? 0),
        in_trust_window: dt <= trustEnd,
      });
    }
    return out;
  } catch {
    return [];
  }
}
