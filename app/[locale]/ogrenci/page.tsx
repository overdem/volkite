import { createAuthClient, createAdminClient } from '@/lib/supabase-server';

async function getStudentLessons(email: string) {
  const db = createAdminClient();
  const { data: student } = await db
    .from('students')
    .select('id, name, level')
    .eq('email', email)
    .single();
  if (!student) return { student: null, lessons: [] };

  const { data: lessons } = await db
    .from('lesson_progress')
    .select('*')
    .eq('student_id', student.id)
    .order('lesson_no');

  return { student, lessons: lessons ?? [] };
}

const STATUS_ICON: Record<string, string> = { done: '✅', pending: '⏳' };
const LEVEL_TR: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

export default async function OgrenciPage() {
  const auth = await createAuthClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user?.email) return null;

  const { student, lessons } = await getStudentLessons(user.email);

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#07283b]">Merhaba, {student.name}! 👋</h1>
        <p className="text-[#8497a1] text-sm mt-1">
          Seviye: {LEVEL_TR[student.level] ?? student.level ?? '—'}
        </p>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-[#07283b]">Ders İlerlemesi</span>
            <span className="text-[#8497a1]">
              {done} / {total} ders
            </span>
          </div>
          <div className="h-2 bg-[#eef1f4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#14b8cf] rounded-full transition-all"
              style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Lesson cards */}
      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${
              lesson.status === 'done' ? 'border-[#14b8cf]' : 'border-[#e4e9ee]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#eef1f4] text-[#8497a1] text-sm font-bold flex items-center justify-center shrink-0">
                {lesson.lesson_no}
              </span>
              <div className="flex-1">
                <p className="font-medium text-[#07283b] text-sm">{lesson.title}</p>
                {lesson.status === 'done' && lesson.completed_at && (
                  <p className="text-xs text-[#8497a1] mt-0.5">
                    {new Date(lesson.completed_at as string).toLocaleDateString('tr-TR')}
                    {lesson.hours ? ` · ${lesson.hours} saat` : ''}
                    {lesson.wind_kn ? ` · ${lesson.wind_kn}kn` : ''}
                  </p>
                )}
                {lesson.instructor_notes && (
                  <p className="text-xs text-[#5a7079] mt-1 bg-[#eef1f4] rounded-lg px-2 py-1">
                    {lesson.instructor_notes}
                  </p>
                )}
              </div>
              <span className="text-lg">{STATUS_ICON[lesson.status] ?? '⏳'}</span>
            </div>
          </div>
        ))}

        {lessons.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center text-[#8497a1] shadow-sm">
            Henüz ders kaydın oluşturulmadı. Volkan seni çok yakında ekleyecek! 🤙
          </div>
        )}
      </div>
    </div>
  );
}
