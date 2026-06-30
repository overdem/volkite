import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import { fetchWind, fetchHourlyForecast } from '@/lib/openmeteo';
import type { WindBand } from '@/lib/wind';
import TakvimView from './TakvimView';

export const revalidate = 600; // 10 dk

export default async function TakvimPage() {
  const { role, userId } = await getUserRole();
  if (!userId || (role !== 'admin' && role !== 'instructor')) {
    return <div className="p-8">Yetkisiz</div>;
  }

  const db = createAdminClient();

  // Öğrenciler: hoca için kendi atandıkları, admin için tümü
  let studentsQ = db
    .from('students')
    .select('id, name, level, assigned_instructor')
    .eq('status', 'active')
    .order('name');
  if (role === 'instructor') studentsQ = studentsQ.eq('assigned_instructor', userId);
  const { data: students } = await studentsQ;

  // Hocalar (admin için kim adına planlandığını gösterir)
  const { data: instructors } = role === 'admin'
    ? await db.from('profiles').select('id, name').eq('active', true).eq('role', 'instructor').order('name')
    : { data: [] };

  // wind_bands
  const { data: bands } = await db.from('wind_bands').select('*');
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

  // Mevcut planlanmış sessions (önümüzdeki 14 gün)
  const fromIso = new Date().toISOString();
  const to = new Date();
  to.setDate(to.getDate() + 14);

  let sessQ = db
    .from('sessions')
    .select('id, student_id, instructor_id, scheduled_at, duration_hours, status, note, students(name)')
    .gte('scheduled_at', fromIso)
    .lte('scheduled_at', to.toISOString())
    .in('status', ['planned', 'done'])
    .order('scheduled_at');
  if (role === 'instructor') sessQ = sessQ.eq('instructor_id', userId);
  const { data: rawSessions } = await sessQ;

  const sessions = (rawSessions ?? []).map((s) => ({
    id: String(s.id),
    studentId: String(s.student_id),
    studentName: (s.students as unknown as { name?: string } | null)?.name ?? '—',
    instructorId: s.instructor_id ? String(s.instructor_id) : null,
    scheduledAt: String(s.scheduled_at),
    durationHours: Number(s.duration_hours ?? 1.5),
    status: String(s.status),
    note: (s.note as string | null) ?? null,
  }));

  // Open-Meteo
  const [current, hourly] = await Promise.all([fetchWind(), fetchHourlyForecast()]);

  return (
    <TakvimView
      role={role}
      userId={userId}
      students={(students ?? []).map((s) => ({
        id: String(s.id),
        name: String(s.name),
        level: String(s.level ?? 'beginner'),
        instructorId: s.assigned_instructor ? String(s.assigned_instructor) : null,
      }))}
      instructors={(instructors ?? []).map((i) => ({ id: String(i.id), name: String(i.name ?? '—') }))}
      bandByLevel={bandByLevel}
      sessions={sessions}
      currentWind={current}
      hourly={hourly}
    />
  );
}
