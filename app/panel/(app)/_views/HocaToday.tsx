import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase-server';

export default async function HocaToday({ instructorId }: { instructorId: string }) {
  const db = createAdminClient();
  const { data: students } = await db
    .from('students')
    .select('id, name, level, status')
    .eq('assigned_instructor', instructorId)
    .eq('status', 'active')
    .order('name');

  const ids = (students ?? []).map((s) => s.id);
  const { data: pendingLessons } = ids.length
    ? await db
        .from('lesson_progress')
        .select('id, student_id, lesson_no, title, status')
        .in('student_id', ids)
        .eq('status', 'pending')
        .order('lesson_no')
    : { data: [] };

  const lessonsByStudent: Record<string, Array<{ id: string; lesson_no: number | null; title: string | null; status: string | null }>> = {};
  (pendingLessons ?? []).forEach((l) => {
    const sid = String(l.student_id);
    lessonsByStudent[sid] ??= [];
    lessonsByStudent[sid].push({
      id: String(l.id),
      lesson_no: l.lesson_no as number | null,
      title: l.title as string | null,
      status: l.status as string | null,
    });
  });

  return (
    <div className="p-4 space-y-4">
      <header>
        <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Bugün</p>
        <h1 className="text-2xl font-bold text-[#07283b]">Öğrencilerim</h1>
      </header>

      {(!students || students.length === 0) && (
        <div className="bg-white rounded-2xl p-6 text-center text-[#8497a1] text-sm">
          Henüz size atanmış aktif öğrenci yok.
          <div className="mt-3">
            <Link
              href="/panel/ogrenciler"
              className="inline-block bg-[#14b8cf] text-[#062131] font-bold px-4 py-2 rounded-lg text-sm"
            >
              Öğrenci Ekle
            </Link>
          </div>
        </div>
      )}

      {students?.map((s) => {
        const next = lessonsByStudent[String(s.id)]?.[0];
        return (
          <Link
            key={String(s.id)}
            href={`/panel/ogrenciler/${String(s.id)}`}
            className="block bg-white rounded-2xl p-4 shadow-sm active:opacity-70 transition-opacity"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-[#07283b]">{String(s.name)}</h2>
              <span className="text-xs uppercase tracking-wider text-[#8497a1] capitalize">
                {String(s.level ?? '—')}
              </span>
            </div>
            {next ? (
              <p className="text-sm text-[#3a5563]">
                Sıradaki ders: <span className="font-semibold">{next.lesson_no}. {next.title ?? '—'}</span>
              </p>
            ) : (
              <p className="text-sm text-green-700">Tüm dersler tamam ✓</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
