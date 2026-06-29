export type WindLabel = 'ideal' | 'uygun' | 'zayıf' | 'sert' | 'mevsimsel';

export interface WindBand {
  level: string;
  min_kn: number;
  max_kn: number;
  max_gust_kn: number;
  ideal_kn: number;
  note_tr: string | null;
}

export interface DayScore {
  date: string;
  in_forecast: boolean;
  avg_kn: number;
  max_gust_kn: number;
  dir: string;
  label: WindLabel;
}

export function scoreDay(
  day: { date: string; avg_kn: number; max_gust_kn: number; dir: string; in_forecast: boolean },
  band: WindBand
): DayScore {
  let label: WindLabel;

  if (!day.in_forecast) {
    label = 'mevsimsel';
  } else if (day.max_gust_kn > band.max_gust_kn || day.avg_kn > band.max_kn) {
    label = 'sert';
  } else if (day.avg_kn < band.min_kn) {
    label = 'zayıf';
  } else {
    // Bant içinde — ideal_kn'e 3kn yakınsa 'ideal', değilse 'uygun'
    label = Math.abs(day.avg_kn - band.ideal_kn) <= 3 ? 'ideal' : 'uygun';
  }

  return { ...day, label };
}
