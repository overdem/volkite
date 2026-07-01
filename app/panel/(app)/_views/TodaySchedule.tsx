import { createAdminClient } from '@/lib/supabase-server';
import { fetchWind, fetchHourlyForecast, utcToIstanbulHourKey } from '@/lib/openmeteo';
import { scoreHour, type WindBand, type HourBucket } from '@/lib/wind';
import { levelShort, levelColor } from '@/lib/level';

const BUCKET_COLOR: Record<HourBucket, string> = {
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red:    'bg-red-100 text-red-700',
};

// Veri yükleme — impure (Date) çağrılar component render'ında olmasın diye
// module-scope helper'a taşındı.
async function loadSchedule(instructorId?: string) {
  const db = createAdminClient();

  // İstanbul yerel bugünün tarihi (YYYY-MM-DD)
  const todayIstanbul = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // Geniş pencere çek, İstanbul gününe göre JS'de süz (zaman dilimi güvenli)
  const from = new Date(Date.now() - 18 * 3600 * 1000).toISOString();
  const to = new Date(Date.now() + 30 * 3600 * 1000).toISOString();

  let q = db
    .from('sessions')
    .select('id, instructor_id, scheduled_at, duration_hours, status, students(name, level)')
    .gte('scheduled_at', from)
    .lte('scheduled_at', to)
    .in('status', ['planned', 'done'])
    .order('scheduled_at');
  if (instructorId) q = q.eq('instructor_id', instructorId);

  const [{ data: rawSessions }, { data: profs }, { data: bands }, hourly, current] =
    await Promise.all([
      q,
      db.from('profiles').select('id, name'),
      db.from('wind_bands').select('*'),
      fetchHourlyForecast(),
      fetchWind(),
    ]);

  const nameById = new Map<string, string>((profs ?? []).map((p) => [String(p.id), String(p.name ?? '—')]));

  const bandByLevel: Record<string, WindBand> = {};
  (bands ?? []).forEach((b) => {
    bandByLevel[String(b.level)] = {
      level: String(b.level),
      min_kn: Number(b.min_kn),
      max_kn: Number(b.max_kn),
      max_gust_kn: Number(b.max_gust_kn),
      ideal_kn: Number(b.ideal_kn),
      note_tr: (b.note_tr as string | null) ?? null,
    };
  });

  const hourByKey = new Map(hourly.map((h) => [h.iso.slice(0, 13), h]));

  const items = (rawSessions ?? [])
    .map((s) => {
      const key = utcToIstanbulHourKey(String(s.scheduled_at)); // "YYYY-MM-DDTHH"
      const st = s.students as unknown as { name?: string; level?: string } | null;
      const level = st?.level ?? '';
      const h = hourByKey.get(key);
      const band = bandByLevel[level];
      const bucket: HourBucket | undefined = h && band ? scoreHour(h, band) : undefined;
      return {
        id: String(s.id),
        date: key.slice(0, 10),
        time: `${key.slice(11)}:00`,
        studentName: st?.name ?? '—',
        studentLevel: level || null,
        instructorName: s.instructor_id ? (nameById.get(String(s.instructor_id)) ?? '—') : null,
        duration: Number(s.duration_hours ?? 1),
        status: String(s.status),
        windKn: h ? h.speed_kn : null,
        gustKn: h ? h.gust_kn : null,
        dir: h ? h.dir : null,
        bucket,
      };
    })
    .filter((s) => s.date === todayIstanbul)
    .sort((a, b) => a.time.localeCompare(b.time));

  return { items, current };
}

// Bugünün programı — kim hangi saatte ders veriyor + o saatteki rüzgâr.
// instructorId verilirse yalnız o hocanın dersleri (hoca görünümü), yoksa tümü (admin).
export default async function TodaySchedule({ instructorId }: { instructorId?: string }) {
  const { items, current } = await loadSchedule(instructorId);

  return (
    <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-[#e4e9ee] flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Bugün</p>
          <h2 className="font-semibold text-[#07283b]">Günün Programı</h2>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#07283b] text-white px-3 py-1.5 rounded-full text-sm">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-[#9fc0cf] text-xs">Rüzgâr</span>
          <strong className="font-display text-[#14b8cf]">{current ? `${current.speed} kn` : '—'}</strong>
          {current && <span className="text-[#9fc0cf] text-xs">{current.dir}</span>}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-6 text-center text-[#8497a1] text-sm">Bugün planlı ders yok.</div>
      ) : (
        <ul className="divide-y divide-[#e4e9ee]">
          {items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-4 md:px-6 py-3">
              <span className="font-mono text-sm font-bold text-[#07283b] w-12 shrink-0">{s.time}</span>
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${levelColor(s.studentLevel)}`}>
                {levelShort(s.studentLevel)}
              </span>
              <span className="text-sm text-[#07283b] font-medium truncate flex-1 min-w-0">
                {s.studentName}
                {s.status === 'done' && ' ✓'}
              </span>
              {!instructorId && s.instructorName && (
                <span className="text-xs text-[#8497a1] whitespace-nowrap hidden sm:inline">
                  {s.instructorName}
                </span>
              )}
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                  s.bucket ? BUCKET_COLOR[s.bucket] : 'bg-[#eef1f4] text-[#8497a1]'
                }`}
              >
                {s.windKn != null ? `${s.windKn} kn${s.dir ? ` · ${s.dir}` : ''}` : '—'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
