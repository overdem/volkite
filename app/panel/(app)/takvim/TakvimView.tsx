'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { scoreHour, type WindBand, type HourBucket } from '@/lib/wind';
import { utcToIstanbulHourKey, type WindData, type HourSlot } from '@/lib/openmeteo';
import { levelShort, levelColor } from '@/lib/level';
import { cancelSession } from '../../actions';
import SlotDialog from './SlotDialog';

type Student = { id: string; name: string; level: string; instructorId: string | null };
type Instructor = { id: string; name: string };
type SessionItem = {
  id: string;
  studentId: string;
  studentName: string;
  studentLevel: string | null;
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
  // Atama artık slot-dialog'undan yapılır; global öğrenci/hoca seçimi yok.
  const [dialog, setDialog] = useState<{ iso: string | null; mode: 'slot' | 'manual' } | null>(null);

  // Saatleri güne grupla
  const byDay = useMemo(() => {
    const map = new Map<string, HourSlot[]>();
    for (const h of hourly) {
      if (!map.has(h.date)) map.set(h.date, []);
      map.get(h.date)!.push(h);
    }
    return map;
  }, [hourly]);

  const hourByIso = useMemo(() => new Map(hourly.map((h) => [h.iso, h])), [hourly]);

  const instructorName = useMemo(() => {
    const m = new Map<string, string>();
    instructors.forEach((i) => m.set(i.id, i.name));
    return m;
  }, [instructors]);

  // Saat başına slot = hoca sayısı (ileride 5+ olabilir). En az 1.
  const capacity = Math.max(1, instructors.length);

  // Global öğrenci kalktı → satırları tek "genel bant"a göre renklendir.
  // (Kişiye özel uygunluk, dialog'da öğrenci seçilince başlıkta görünür.)
  const generalBand = useMemo<WindBand | undefined>(() => {
    const bands = Object.values(bandByLevel);
    if (bands.length === 0) return undefined;
    return {
      level: 'general',
      min_kn: Math.min(...bands.map((b) => b.min_kn)),
      max_kn: Math.max(...bands.map((b) => b.max_kn)),
      max_gust_kn: Math.max(...bands.map((b) => b.max_gust_kn)),
      ideal_kn: Math.round(bands.reduce((s, b) => s + b.ideal_kn, 0) / bands.length),
      note_tr: null,
    };
  }, [bandByLevel]);

  const dates = useMemo(() => Array.from(byDay.keys()).sort(), [byDay]);
  const trustDates = dates.slice(0, 3);
  const trendDates = dates.slice(3);

  // Forecast dışındaki (ileri tarihli, manuel eklenmiş) planlı dersler
  const forecastDateSet = useMemo(() => new Set(dates), [dates]);
  const futureSessions = useMemo(
    () =>
      sessions
        .filter((s) => !forecastDateSet.has(utcToIstanbulHourKey(s.scheduledAt).slice(0, 10)))
        .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    [sessions, forecastDateSet]
  );

  function openSlot(iso: string) {
    setDialog({ iso, mode: 'slot' });
  }

  function cancel(id: string) {
    if (!confirm('Bu planlamayı iptal et?')) return;
    startTransition(async () => {
      await cancelSession(id);
      router.refresh();
    });
  }

  // Açık dialog için bağlam (slot modu): rüzgâr etiketi + renk
  const dlgHour = dialog?.mode === 'slot' && dialog.iso ? hourByIso.get(dialog.iso) : undefined;
  const dlgBucket = dlgHour && generalBand ? scoreHour(dlgHour, generalBand) : undefined;
  const dlgWindLabel = dlgHour ? `${dlgHour.speed_kn} kn — ${dlgBucket ? BUCKET_LABEL[dlgBucket] : ''}` : undefined;
  const dlgColor = dlgBucket ? { bg: BUCKET_COLOR[dlgBucket].bg, text: BUCKET_COLOR[dlgBucket].text } : undefined;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 pb-24">
      <header className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Takvim</p>
          <h1 className="text-2xl font-bold text-[#07283b]">Rüzgâra Göre Planlama</h1>
        </div>
        <WindChip wind={currentWind} />
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-900 leading-snug flex-1 min-w-[240px]">
          ⚠️ Tahmin garanti değil — gerçek rüzgâr değişir.
          <strong> İlk 3 gün</strong> güvenilir, sonrası <strong>eğilim</strong> gösterir.
        </div>
        <button
          type="button"
          onClick={() => setDialog({ iso: null, mode: 'manual' })}
          className="bg-white border border-[#e4e9ee] text-[#07283b] font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#eef1f4] whitespace-nowrap"
        >
          + İleri tarih ata
        </button>
      </div>

      <p className="text-xs text-[#8497a1]">
        Bir saatteki <strong>+ Planla</strong>&apos;ya bas → öğrenci ve hocayı seç. Saat başına {capacity} slot (hoca sayısı).
      </p>

      {/* İleri tarihli (forecast dışı) planlı dersler */}
      {futureSessions.length > 0 && (
        <section className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <h2 className="text-sm font-bold text-[#3a5563] uppercase tracking-wider">İleri Tarihli Dersler</h2>
          {futureSessions.map((s) => {
            const key = utcToIstanbulHourKey(s.scheduledAt);
            const dt = new Date(key + ':00:00');
            return (
              <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-[#eef1f4]">
                <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
                  <span className="font-mono font-bold text-[#07283b] whitespace-nowrap">
                    {dt.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} {key.slice(11)}:00
                  </span>
                  <span className={`text-[9px] font-bold px-1 py-0 rounded ${levelColor(s.studentLevel)}`}>
                    {levelShort(s.studentLevel)}
                  </span>
                  <span className="text-[#07283b] truncate">{s.studentName}</span>
                  {s.instructorId && (
                    <span className="text-[10px] text-[#8497a1] whitespace-nowrap">
                      → {instructorName.get(s.instructorId) ?? '—'}
                    </span>
                  )}
                </div>
                {(role === 'admin' || s.instructorId === userId) && s.status === 'planned' && (
                  <button
                    type="button"
                    onClick={() => cancel(s.id)}
                    disabled={pending}
                    className="text-xs text-red-700 hover:text-red-900"
                  >
                    İptal
                  </button>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* 3 gün — saatlik kesin */}
      {trustDates.map((date) => (
        <DayBlock
          key={date}
          date={date}
          hours={byDay.get(date) ?? []}
          band={generalBand}
          sessions={sessions.filter((s) => utcToIstanbulHourKey(s.scheduledAt).startsWith(date))}
          onPlan={openSlot}
          onCancel={cancel}
          pending={pending}
          instructorName={instructorName}
          role={role}
          userId={userId}
          capacity={capacity}
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
              band={generalBand}
              sessions={sessions.filter((s) => utcToIstanbulHourKey(s.scheduledAt).startsWith(date))}
              onPlan={openSlot}
              onCancel={cancel}
              pending={pending}
              instructorName={instructorName}
              role={role}
              userId={userId}
              capacity={capacity}
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

      {dialog && (
        <SlotDialog
          onClose={() => setDialog(null)}
          onDone={() => router.refresh()}
          role={role}
          students={students}
          instructors={instructors}
          iso={dialog.iso}
          windLabel={dlgWindLabel}
          bucketColor={dlgColor}
          sessions={sessions}
          mode={dialog.mode}
        />
      )}
    </div>
  );
}

function WindChip({ wind }: { wind: WindData | null }) {
  return (
    <div className="inline-flex items-center gap-2 bg-[#07283b] text-white px-3 py-2 rounded-full text-sm">
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
  date, hours, band, sessions, onPlan, onCancel, pending,
  instructorName, role, userId, capacity, trust,
}: {
  date: string;
  hours: HourSlot[];
  band: WindBand | undefined;
  sessions: SessionItem[];
  onPlan: (iso: string) => void;
  onCancel: (id: string) => void;
  pending: boolean;
  instructorName: Map<string, string>;
  role: 'admin' | 'instructor';
  userId: string;
  capacity: number;
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
      <HourRows
        hours={hours}
        band={band}
        sessions={sessions}
        onPlan={onPlan}
        onCancel={onCancel}
        pending={pending}
        instructorName={instructorName}
        role={role}
        userId={userId}
        capacity={capacity}
      />
    </section>
  );
}

// Bir günün saatlik satırları — saat başına 'capacity' slot (paralel hoca).
// DayBlock ve genişletilmiş TrendDay tarafından paylaşılır.
function HourRows({
  hours, band, sessions, onPlan, onCancel, pending, instructorName, role, userId, capacity,
}: {
  hours: HourSlot[];
  band: WindBand | undefined;
  sessions: SessionItem[];
  onPlan: (iso: string) => void;
  onCancel: (id: string) => void;
  pending: boolean;
  instructorName: Map<string, string>;
  role: 'admin' | 'instructor';
  userId: string;
  capacity: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-1.5">
      {hours.map((h) => {
        const bucket: HourBucket = band ? scoreHour(h, band) : 'red';
        const color = BUCKET_COLOR[bucket];
        const hourSessions = sessions.filter(
          (s) => utcToIstanbulHourKey(s.scheduledAt) === h.iso.slice(0, 13)
        );
        const used = hourSessions.length;
        const full = used >= capacity;

        return (
          <div key={h.iso} className={`rounded-lg px-3 py-2 ${color.bg}`}>
            {/* Üst satır: saat + rüzgâr + slot durumu / Planla */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-mono text-sm font-bold text-[#07283b] w-12">
                  {String(h.hour).padStart(2, '0')}:00
                </span>
                <span className={`text-sm font-bold ${color.text}`}>{h.speed_kn} kn</span>
                <span className="text-xs text-[#3a5563]">↗{h.gust_kn} · {h.dir}</span>
                <span className={`text-xs font-bold ${color.text} hidden sm:inline`}>
                  {BUCKET_LABEL[bucket]}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold ${used ? 'text-[#3a5563]' : 'text-[#8497a1]'}`}>
                  {used}/{capacity}
                </span>
                {!full ? (
                  <button
                    type="button"
                    onClick={() => onPlan(h.iso)}
                    disabled={pending}
                    className={`text-xs font-bold px-3 py-1 rounded-full disabled:opacity-60 ${
                      bucket === 'red'
                        ? 'bg-white text-[#062131] border border-[#14b8cf]/50 hover:bg-[#eef1f4]'
                        : 'bg-[#14b8cf] text-[#062131] hover:bg-[#0fa3b8]'
                    }`}
                  >
                    + Planla
                  </button>
                ) : (
                  <span className="text-[10px] text-[#8497a1]">dolu</span>
                )}
              </div>
            </div>

            {/* Alt satır: o saatteki dersler (çoklu) */}
            {hourSessions.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {hourSessions.map((session) => {
                  const canCancel =
                    session.status === 'planned' && (role === 'admin' || session.instructorId === userId);
                  return (
                    <span
                      key={session.id}
                      className="text-xs font-bold text-[#062131] bg-white border border-[#14b8cf]/40 px-2 py-1 rounded-full flex items-center gap-1.5"
                    >
                      <span className={`text-[9px] font-bold px-1 py-0 rounded ${levelColor(session.studentLevel)}`}>
                        {levelShort(session.studentLevel)}
                      </span>
                      {session.studentName}
                      {session.status === 'done' && ' ✓'}
                      {session.instructorId && (
                        <span className="text-[10px] text-[#8497a1] font-normal">
                          · {instructorName.get(session.instructorId) ?? '—'}
                        </span>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => onCancel(session.id)}
                          disabled={pending}
                          className="text-red-700 hover:text-red-900 ml-0.5"
                          aria-label="İptal"
                        >
                          ✕
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {hours.length === 0 && (
        <div className="text-center text-xs text-[#8497a1] py-4">Veri yok</div>
      )}
    </div>
  );
}

function TrendDay({
  date, hours, band, sessions, onPlan, onCancel, pending, instructorName, role, userId, capacity,
}: {
  date: string;
  hours: HourSlot[];
  band: WindBand | undefined;
  sessions: SessionItem[];
  onPlan: (iso: string) => void;
  onCancel: (id: string) => void;
  pending: boolean;
  instructorName: Map<string, string>;
  role: 'admin' | 'instructor';
  userId: string;
  capacity: number;
}) {
  const [expanded, setExpanded] = useState(sessions.length > 0);
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
    <div className="bg-white rounded-xl p-3 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-[#07283b]">
            {DAY_LABELS[d.getDay()]} {d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
          </div>
          <div className="text-xs text-[#8497a1]">Tahmini eğilim</div>
        </div>
        <div className="flex items-center gap-2 text-xs">
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
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-1 text-xs font-bold text-[#14b8cf] hover:text-[#0fa3b8] whitespace-nowrap"
          >
            {expanded ? 'Gizle' : 'Saatler / ders ata'}
          </button>
        </div>
      </div>
      {expanded && (
        <HourRows
          hours={hours}
          band={band}
          sessions={sessions}
          onPlan={onPlan}
          onCancel={onCancel}
          pending={pending}
          instructorName={instructorName}
          role={role}
          userId={userId}
          capacity={capacity}
        />
      )}
    </div>
  );
}
