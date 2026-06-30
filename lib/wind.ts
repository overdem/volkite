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

export type HourBucket = 'green' | 'yellow' | 'red';

// Saat bazlı renklendirme — wind_bands seviyesine göre
// green = bant içi (rahat); yellow = sınırda; red = çok zayıf veya çok sert
export function scoreHour(hour: { speed_kn: number; gust_kn: number }, band: WindBand): HourBucket {
  const { speed_kn: s, gust_kn: g } = hour;
  const { min_kn: mn, max_kn: mx, max_gust_kn: mg } = band;

  // Çok sert: gust limit aşıldı veya speed limit + 2 üstü
  if (g > mg + 1 || s > mx + 2) return 'red';
  // Çok zayıf: speed min - 3 altında
  if (s < mn - 3) return 'red';
  // Sınırda: speed min-3..min veya max..max+2 veya gust mg-2..mg+1
  if (s < mn || s > mx || g > mg - 2) return 'yellow';
  // Bant içi → yeşil
  return 'green';
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
