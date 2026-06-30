// Seviye gösterim yardımcıları

export const LEVEL_TR: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

// Kısa kod — listeler ve etiketler için
export const LEVEL_SHORT: Record<string, string> = {
  beginner: 'BG',
  intermediate: 'OR',
  advanced: 'İL',
};

// Renk (badge için)
export const LEVEL_COLOR: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export function levelLabel(level: string | null | undefined): string {
  return LEVEL_TR[String(level ?? '')] ?? String(level ?? '—');
}

export function levelShort(level: string | null | undefined): string {
  return LEVEL_SHORT[String(level ?? '')] ?? '?';
}

export function levelColor(level: string | null | undefined): string {
  return LEVEL_COLOR[String(level ?? '')] ?? 'bg-gray-100 text-gray-700';
}
