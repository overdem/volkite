export interface WindData {
  speed: number;
  dir: string;
}

const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function toCompass(deg: number): string {
  return DIRS[Math.round(deg / 45) % 8];
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
