import { describe, it, expect } from 'vitest';
import { scoreDay } from '@/lib/wind';
import type { WindBand } from '@/lib/wind';

const beginner: WindBand = {
  level: 'beginner',
  min_kn: 11,
  max_kn: 18,
  max_gust_kn: 22,
  ideal_kn: 14,
  note_tr: null,
};

const intermediate: WindBand = {
  level: 'intermediate',
  min_kn: 14,
  max_kn: 24,
  max_gust_kn: 28,
  ideal_kn: 18,
  note_tr: null,
};

const advanced: WindBand = {
  level: 'advanced',
  min_kn: 17,
  max_kn: 32,
  max_gust_kn: 40,
  ideal_kn: 24,
  note_tr: null,
};

// ─── mevsimsel ────────────────────────────────────────────────────────────────

describe('scoreDay — mevsimsel (tahmin penceresi dışı)', () => {
  it('in_forecast=false her zaman mevsimsel döner', () => {
    const r = scoreDay({ date: '2025-09-01', avg_kn: 15, max_gust_kn: 20, dir: 'NW', in_forecast: false }, beginner);
    expect(r.label).toBe('mevsimsel');
  });

  it('rüzgâr güçlü olsa bile pencere dışı → mevsimsel', () => {
    const r = scoreDay({ date: '2025-09-01', avg_kn: 30, max_gust_kn: 45, dir: 'NW', in_forecast: false }, advanced);
    expect(r.label).toBe('mevsimsel');
  });
});

// ─── zayıf ────────────────────────────────────────────────────────────────────

describe('scoreDay — zayıf (rüzgâr yetersiz)', () => {
  it('avg < min_kn → zayıf', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 8, max_gust_kn: 12, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).toBe('zayıf');
  });

  it('avg tam min_kn sınırında → zayıf değil', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 11, max_gust_kn: 15, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).not.toBe('zayıf');
  });

  it('intermediate için avg 13 → zayıf', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 13, max_gust_kn: 18, dir: 'NE', in_forecast: true }, intermediate);
    expect(r.label).toBe('zayıf');
  });
});

// ─── sert ─────────────────────────────────────────────────────────────────────

describe('scoreDay — sert (güçlü/tehlikeli)', () => {
  it('gust > max_gust_kn → sert', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 15, max_gust_kn: 25, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).toBe('sert');
  });

  it('avg > max_kn → sert (gust uygun olsa bile)', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 20, max_gust_kn: 21, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).toBe('sert');
  });

  it('hem avg hem gust aşımı → sert', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 25, max_gust_kn: 35, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).toBe('sert');
  });

  it('avg tam max_kn sınırında, gust uygun → sert değil', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 18, max_gust_kn: 21, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).not.toBe('sert');
  });
});

// ─── ideal ────────────────────────────────────────────────────────────────────

describe('scoreDay — ideal (ideal_kn yakininda)', () => {
  it('avg tam ideal_kn → ideal', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 14, max_gust_kn: 18, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).toBe('ideal');
  });

  it('avg ideal_kn ± 3 içinde → ideal', () => {
    const r1 = scoreDay({ date: '2025-07-10', avg_kn: 11, max_gust_kn: 15, dir: 'NW', in_forecast: true }, beginner);
    const r2 = scoreDay({ date: '2025-07-10', avg_kn: 17, max_gust_kn: 20, dir: 'NW', in_forecast: true }, beginner);
    // 11 = 14-3 (sınırda, ideal), 17 = 14+3 (sınırda, ideal)
    expect(r1.label).toBe('ideal');
    expect(r2.label).toBe('ideal');
  });

  it('intermediate için ideal_kn=18, avg=18 → ideal', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 18, max_gust_kn: 22, dir: 'N', in_forecast: true }, intermediate);
    expect(r.label).toBe('ideal');
  });
});

// ─── uygun ────────────────────────────────────────────────────────────────────

describe('scoreDay — uygun (bant içi ama ideal değil)', () => {
  it('bant ici ama ideal_kn den >3 uzak → uygun', () => {
    // beginner ideal=14, max=18; avg=18 → 18-14=4 > 3 → uygun
    const r = scoreDay({ date: '2025-07-10', avg_kn: 18, max_gust_kn: 20, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).toBe('uygun');
  });

  it('advanced için avg=20 → uygun (ideal=24, fark=4)', () => {
    const r = scoreDay({ date: '2025-07-10', avg_kn: 20, max_gust_kn: 28, dir: 'N', in_forecast: true }, advanced);
    expect(r.label).toBe('uygun');
  });
});

// ─── DayScore alan geçişi ─────────────────────────────────────────────────────

describe('scoreDay — DayForecast → DayScore alan geçişi', () => {
  it('tüm giriş alanları çıkışta korunur', () => {
    const day = { date: '2025-07-15', avg_kn: 16, max_gust_kn: 20, dir: 'NE', in_forecast: true };
    const r = scoreDay(day, beginner);
    expect(r.date).toBe('2025-07-15');
    expect(r.avg_kn).toBe(16);
    expect(r.max_gust_kn).toBe(20);
    expect(r.dir).toBe('NE');
    expect(r.in_forecast).toBe(true);
  });
});

// ─── Open-Meteo yanıt eşleme ──────────────────────────────────────────────────

describe('Open-Meteo yanıt formatı doğrulama', () => {
  it('kn cinsinden avg değerleri doğru skorlanır', () => {
    // Simüle Open-Meteo çıktısı: beginner için ideal bölge
    const omDay = { date: '2025-07-20', avg_kn: 13.8, max_gust_kn: 19.2, dir: 'NW', in_forecast: true };
    const r = scoreDay(omDay, beginner);
    expect(['ideal', 'uygun']).toContain(r.label);
    expect(r.label).toBe('ideal'); // |13.8-14| = 0.2 ≤ 3
  });

  it('gust sınırı kenar vakası — tam max_gust_kn → sert değil', () => {
    const r = scoreDay({ date: '2025-07-20', avg_kn: 15, max_gust_kn: 22, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).not.toBe('sert');
  });

  it('gust max_gust_kn + 0.1 → sert', () => {
    const r = scoreDay({ date: '2025-07-20', avg_kn: 15, max_gust_kn: 22.1, dir: 'NW', in_forecast: true }, beginner);
    expect(r.label).toBe('sert');
  });
});
