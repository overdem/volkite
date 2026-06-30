import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase-server';
import StudentTabs from './StudentTabs';

async function getStudent(id: string) {
  const db = createAdminClient();
  const [student, lessons, payments, accommodation, equipment, mediaRes, sessionsRes] = await Promise.all([
    db.from('students').select('*').eq('id', id).single(),
    db.from('lesson_progress').select('*').eq('student_id', id).order('lesson_no'),
    db.from('payments').select('*').eq('student_id', id).order('created_at' as 'paid', { ascending: false }),
    db.from('accommodation').select('*').eq('student_id', id),
    db.from('equipment').select('*').eq('student_id', id),
    db.from('student_media').select('*').eq('student_id', id).order('created_at', { ascending: false }),
    db.from('sessions').select('*').eq('student_id', id).order('scheduled_at'),
  ]);
  return {
    student: student.data,
    lessons: lessons.data ?? [],
    payments: payments.data ?? [],
    accommodation: accommodation.data ?? [],
    equipment: equipment.data ?? [],
    media: mediaRes.data ?? [],
    sessions: sessionsRes.data ?? [],
  };
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getStudent(id);
  if (!data.student) notFound();

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#07283b]">{data.student.name}</h1>
        <p className="text-sm text-[#8497a1] mt-0.5">
          {data.student.level ?? 'seviye belirsiz'} &middot; {data.student.contact ?? '—'}
        </p>
      </div>

      <StudentTabs studentId={id} data={data} />

    </div>
  );
}
