'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { scoreHour, type WindBand, type HourBucket } from '@/lib/wind';
import type { WindData, HourSlot } from '@/lib/openmeteo';
import { createSession, cancelSession } from '../../actions';

type Student = { id: string; name: string; level: string; instructorId: string | null };
type Instructor = { id: string; name: string };
type SessionItem = {
  id: string;
  studentId: string;
  studentName: string;
  instructorId: string | null;
  scheduledAt: string;
  durationHours: number;
  status: string;
  note: string | null;
};

type Props = {
  role: 'admin' | 'instructor';
  userId: string;
  students: Student[];
  instructors: Instructor[];
  bandByLevel: Record<string, WindBand>;
  sessions: SessionItem[];
  currentWind: WindData | null;
  hourly: HourSlot[];
};

const DAY_LABELS: Record<number, string> = {
  0: 'Paz', 1: 'Pzt', 2: 'Sal', 3: 'Çar', 4: 'Per', 5: 'Cum', 6: 'Cmt',
};

const BUCKET_COLOR: Record<HourBucket, { bg: string; text: string; ring: string }> = {
  green:  { bg: 'bg-green-100',  text: 'text-green-800',  ring: 'ring-green-300' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-300' },
  red:    { bg: 'bg-red-100',    text: 'text-red-700',    ring: 'ring-red-200' },
};

const BUCKET_LABEL: Record<HourBucket, string> = {
  green:  'İdeal',
  yellow: 'Sınırda',
  red:    'Uygun değil',
};

export default function TakvimView({
  role, userId, students, instructors, bandByLevel, sessions, currentWind, hourly,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState<string>(students[0]?.id ?? '');
  const [error, setError] = useState('');

  const selected = students.find((s) => s.id === studentId);
  const band = selected ? bandByLevel[selected.level] : undefined;

  // Saatleri güne grupla
  const byDay = useMemo(() => {
    const map = new Map<string, HourSlot[]>();
    for (const h of hourly) {
      if (!map.has(h.date)) map.set(h.date, []);
      map.get(h.date)!.push(h);
    }
    return map;
  }, [hourly]);

  const dates = useMemo(() => Array.from(byDay.keys()).sort(), [byDay]);
  const trustDates = dates.slice(0, 3);
  const trendDates = dates.slice(3);

  // Belirli saatte planlanan session var mı (öğrenci+saat)
  const sessionAt = (iso: string) => sessions.find((s) => s.scheduledAt.slice(0, 13) === iso.slice(0, 13));

  function planAt(iso: string) {
    if (!studentId) { setError('Önce öğrenci seç'); return; }
    setError('');
    startTransition(async () => {
      const res = await createSession({
        studentId,
        scheduledAt: new Date(iso).toISOString(),
        durationHours: 1.5,
      });
      if (res?.error) setError(res.error);
      router.refresh();
    });
  }

  function cancel(id: string) {
    if (!confirm('Bu planlamayı iptal et?')) return;
    startTransition(async () => {
      await cancelSession(id);
      router.refresh();
    });
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 pb-24">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Takvim</p>
          <h1 className="text-2xl font-bold text-[#07283b]">Rüzgâra Göre Planlama</h1>
        </div>
        <WindChip wind={currentWind} />
      </header>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-900 leading-snug">
        ⚠️ Tahmin garanti değil — gerçek rüzgâr değişir.
        <strong> İlk 3 gün</strong> güvenilir, sonrası <strong>eğilim</strong> gösterir.
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#8497a1] mb-1">Öğrenci</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Seç…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {s.level}</option>
              ))}
            </select>
          </div>
          {band && (
            <div className="bg-[#eef1f4] rounded-lg p-3 text-xs text-[#3a5563]">
              <div className="font-bold text-[#07283b]">
                {selected?.name} · {selected?.level}
              </div>
              <div>İdeal {band.ideal_kn}kn · {band.min_kn}–{band.max_kn}kn · hamle ≤ {band.max_gust_kn}kn</div>
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {/* 3 gün — saatlik kesin */}
      {trustDates.map((date) => (
        <DayBlock
          key={date}
          date={date}
          hours={byDay.get(date) ?? []}
          band={band}
          sessions={sessions.filter((s) => s.scheduledAt.startsWith(date))}
          onPlan={planAt}
          onCancel={cancel}
          pending={pending}
          studentSelected={!!studentId}
          trust
        />
      ))}

      {/* 4-14 gün — eğilim */}
      {trendDates.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-[#3a5563] uppercase tracking-wider">Eğilim (tahmini)</h2>
          {trendDates.map((date) => (
            <TrendDay
              key={date}
              date={date}
              hours={byDay.get(date) ?? []}
              band={band}
            />
          ))}
        </section>
      )}

      {/* Admin için tüm hocalara dağıtım */}
      {role === 'admin' && instructors.length > 0 && (
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-[#3a5563] uppercase tracking-wider mb-3">Hoca Yükü (önümüzdeki 7 gün)</h2>
          <div className="space-y-1.5">
            {instructors.map((i) => {
              const count = sessions.filter(
                (s) => s.instructorId === i.id && s.status === 'planned'
              ).length;
              return (
                <div key={i.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#07283b]">{i.name}</span>
                  <span className="text-[#8497a1]">{count} planlı</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function WindChip({ wind }: { wind: WindData | null }) {
  return (
    <div className="inline-flex items-center gap-2 bg-[#062131] text-white px-3 py-2 rounded-full text-sm">
      <span className="w-2 h-2 rounded-full bg-green-400" />
      <span className="text-[#9fc0cf]">Şu an</span>
      <strong className="font-display text-[#14b8cf]">
        {wind ? `${wind.speed} kn` : '—'}
      </strong>
      {wind && <span className="text-[#9fc0cf] text-xs">{wind.dir}</span>}
    </div>
  );
}

function DayBlock({
  date, hours, band, sessions, onPlan, onCancel, pending, studentSelected, trust,
}: {
  date: string;
  hours: HourSlot[];
  band: WindBand | undefined;
  sessions: SessionItem[];
  onPlan: (iso: string) => void;
  onCancel: (id: string) => void;
  pending: boolean;
  studentSelected: boolean;
  trust: boolean;
}) {
  const d = new Date(date + 'T12:00:00');
  const dayLabel = DAY_LABELS[d.getDay()];
  const today = new Date().toISOString().slice(0, 10) === date;

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm">
      <header className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-[#8497a1]">{dayLabel}</div>
          <div className="text-lg font-bold text-[#07283b]">
            {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
            {today && <span className="ml-2 text-xs text-[#14b8cf]">Bugün</span>}
          </div>
        </div>
        {trust && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-bold">Kesin</span>}
      </header>
      <div className="grid grid-cols-1 gap-1.5">
        {hours.map((h) => {
          const bucket: HourBucket = band ? scoreHour(h, band) : 'red';
          const color = BUCKET_COLOR[bucket];
          const session = sessions.find((s) => s.scheduledAt.slice(0, 13) === h.iso.slice(0, 13));
          return (
            <div
              key={h.iso}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 ${color.bg}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-mono text-sm font-bold text-[#07283b] w-12">
                  {String(h.hour).padStart(2, '0')}:00
                </span>
                <span className={`text-sm font-bold ${color.text}`}>{h.speed_kn} kn</span>
                <span className="text-xs text-[#3a5563]">
                  ↗{h.gust_kn} · {h.dir}
                </span>
                <span className={`text-xs font-bold ${color.text} hidden sm:inline`}>
                  {BUCKET_LABEL[bucket]}
                </span>
              </div>
              {session ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#062131] bg-white border border-[#14b8cf]/40 px-2 py-1 rounded-full">
                    {session.studentName}
                    {session.status === 'done' && ' ✓'}
                  </span>
                  {session.status === 'planned' && (
                    <button
                      type="button"
                      onClick={() => onCancel(session.id)}
                      disabled={pending}
                      className="text-xs text-red-700 hover:text-red-900"
                    >
                      İptal
                    </button>
                  )}
                </div>
              ) : (
                bucket !== 'red' && studentSelected && (
                  <button
                    type="button"
                    onClick={() => onPlan(h.iso)}
                    disabled={pending}
                    className="text-xs font-bold bg-[#14b8cf] text-[#062131] px-3 py-1 rounded-full hover:bg-[#0fa3b8] disabled:opacity-60"
                  >
                    Planla
                  </button>
                )
              )}
            </div>
          );
        })}
        {hours.length === 0 && (
          <div className="text-center text-xs text-[#8497a1] py-4">Veri yok</div>
        )}
      </div>
    </section>
  );
}

function TrendDay({ date, hours, band }: { date: string; hours: HourSlot[]; band: WindBand | undefined }) {
  const d = new Date(date + 'T12:00:00');
  const morning = hours.filter((h) => h.hour < 12);
  const afternoon = hours.filter((h) => h.hour >= 12 && h.hour < 17);
  const evening = hours.filter((h) => h.hour >= 17);

  const avg = (arr: HourSlot[]) =>
    arr.length ? Math.round(arr.reduce((s, h) => s + h.speed_kn, 0) / arr.length) : 0;
  const bucket = (avgKn: number): HourBucket => {
    if (!band) return 'red';
    if (avgKn > band.max_kn + 2) return 'red';
    if (avgKn < band.min_kn - 3) return 'red';
    if (avgKn < band.min_kn || avgKn > band.max_kn) return 'yellow';
    return 'green';
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between gap-3">
      <div>
        <div className="text-sm font-bold text-[#07283b]">
          {DAY_LABELS[d.getDay()]} {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
        </div>
        <div className="text-xs text-[#8497a1]">Tahmini eğilim</div>
      </div>
      <div className="flex gap-2 text-xs">
        {[
          { label: 'Sabah', avg: avg(morning) },
          { label: 'Öğlen', avg: avg(afternoon) },
          { label: 'Akşam', avg: avg(evening) },
        ].map(({ label, avg: a }) => {
          const b = bucket(a);
          const color = BUCKET_COLOR[b];
          return (
            <div key={label} className={`text-center px-2 py-1 rounded ${color.bg}`}>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${color.text}`}>{label}</div>
              <div className={`text-xs font-bold ${color.text}`}>{a} kn</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
