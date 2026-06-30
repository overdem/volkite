import { createAuthClient, createAdminClient } from '@/lib/supabase-server';

async function getStudentData(email: string) {
  const db = createAdminClient();
  const { data: student } = await db
    .from('students')
    .select('id, name, level')
    .eq('email', email)
    .single();
  if (!student) return { student: null, lessons: [], sessions: [] };

  const [lessonsRes, sessionsRes] = await Promise.all([
    db.from('lesson_progress').select('*').eq('student_id', student.id).order('lesson_no'),
    db
      .from('sessions')
      .select('id, scheduled_at, duration_hours, status, completed_at, wind_kn, note')
      .eq('student_id', student.id)
      .in('status', ['planned', 'done'])
      .order('scheduled_at'),
  ]);

  return { student, lessons: lessonsRes.data ?? [], sessions: sessionsRes.data ?? [] };
}

const STATUS_ICON: Record<string, string> = { done: '✅', pending: '⏳' };
const LEVEL_TR: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

type SessionRow = {
  id: string;
  scheduled_at: string;
  duration_hours: number | null;
  status: string;
  completed_at: string | null;
  wind_kn: number | null;
  note: string | null;
};

export default async function OgrenciPage() {
  const auth = await createAuthClient();
  const { data: { user } } = await auth.auth.getUser();

  if (!user?.email) return null;

  const { student, lessons, sessions } = await getStudentData(user.email);

  if (!student) {
    return (
      <div className="text-center py-16 text-[#8497a1]">
        <p className="text-lg">Öğrenci kaydın bulunamadı.</p>
        <p className="text-sm mt-2">Bu e-posta adresiyle kayıtlı bir öğrenci yok.</p>
      </div>
    );
  }

  const done = lessons.filter((l) => l.status === 'done').length;
  const total = lessons.length;
  const upcoming = (sessions as SessionRow[]).filter((s) => s.status === 'planned' && new Date(s.scheduled_at) > new Date());
  const nextSession = upcoming[0] ?? null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#07283b]">Merhaba, {String(student.name)}! 👋</h1>
        <p className="text-[#8497a1] text-sm mt-1">
          Seviye: {LEVEL_TR[String(student.level)] ?? String(student.level ?? '—')}
        </p>
      </div>

      {nextSession && (
        <div className="bg-[#14b8cf]/10 border border-[#14b8cf]/30 rounded-2xl p-5 mb-6">
          <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold mb-1">Sıradaki Ders</p>
          <p className="text-lg font-bold text-[#07283b]">
            {new Date(nextSession.scheduled_at).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul' })}
          </p>
          <p className="text-sm text-[#3a5563]">
            {new Date(nextSession.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}
            {' · '}{nextSession.duration_hours} saat
          </p>
          <p className="text-xs text-[#8497a1] mt-2">
            ⚠️ Rüzgâra göre saatler değişebilir. Hocan iletişime geçecek.
          </p>
        </div>
      )}

      {total > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-[#07283b]">Ders İlerlemesi</span>
            <span className="text-[#8497a1]">{done} / {total} ders</span>
          </div>
          <div className="h-2 bg-[#eef1f4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#14b8cf] rounded-full transition-all"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <h2 className="text-sm font-bold text-[#3a5563] uppercase tracking-wider mb-3">Müfredat</h2>
      <div className="space-y-3 mb-6">
        {lessons.map((lesson) => (
          <div
            key={String(lesson.id)}
            className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${
              lesson.status === 'done' ? 'border-[#14b8cf]' : 'border-[#e4e9ee]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#eef1f4] text-[#8497a1] text-sm font-bold flex items-center justify-center shrink-0">
                {String(lesson.lesson_no)}
              </span>
              <div className="flex-1">
                <p className="font-medium text-[#07283b] text-sm">{String(lesson.title)}</p>
                {lesson.status === 'done' && lesson.completed_at && (
                  <p className="text-xs text-[#8497a1] mt-0.5">
                    {new Date(lesson.completed_at as string).toLocaleDateString('tr-TR')}
                    {lesson.hours ? ` · ${lesson.hours} saat` : ''}
                    {lesson.wind_kn ? ` · ${lesson.wind_kn}kn` : ''}
                  </p>
                )}
                {lesson.instructor_notes && (
                  <p className="text-xs text-[#5a7079] mt-1 bg-[#eef1f4] rounded-lg px-2 py-1">
                    {String(lesson.instructor_notes)}
                  </p>
                )}
              </div>
              <span className="text-lg">{STATUS_ICON[String(lesson.status)] ?? '⏳'}</span>
            </div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-[#8497a1] shadow-sm">
            Henüz ders kaydın oluşturulmadı. Volkan seni çok yakında ekleyecek! 🤙
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <>
          <h2 className="text-sm font-bold text-[#3a5563] uppercase tracking-wider mb-3">Planlanmış & Yapılan</h2>
          <div className="space-y-2">
            {(sessions as SessionRow[]).map((s) => {
              const dt = new Date(s.scheduled_at);
              const isDone = s.status === 'done';
              return (
                <div
                  key={s.id}
                  className={`bg-white rounded-xl shadow-sm p-3 flex items-center justify-between border-l-4 ${
                    isDone ? 'border-[#14b8cf]' : 'border-yellow-300'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-[#07283b]">
                      {dt.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Istanbul' })}
                      {' · '}
                      {dt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}
                    </div>
                    <div className="text-xs text-[#8497a1]">
                      {isDone ? `Yapıldı${s.wind_kn ? ` · ${s.wind_kn}kn` : ''}` : 'Planlandı'}
                      {s.note && ` · ${s.note}`}
                    </div>
                  </div>
                  <span className="text-lg">{isDone ? '✅' : '📅'}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
