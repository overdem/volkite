import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import MediaUploader from './MediaUploader';
import MediaRow from './MediaRow';

export default async function MedyaPage() {
  const { role } = await getUserRole();
  if (role !== 'admin') redirect('/panel');

  const db = createAdminClient();
  const [{ data: media }, { data: students }] = await Promise.all([
    db
      .from('student_media')
      .select('id, student_id, type, r2_key, thumb_key, preview_key, downloadable, created_at, students(name)')
      .order('created_at', { ascending: false })
      .limit(200),
    db.from('students').select('id, name').order('name'),
  ]);

  return (
    <div className="p-8 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Medya</p>
        <h1 className="text-2xl font-bold text-[#07283b]">Foto / Video Yönetimi</h1>
        <p className="text-sm text-[#3a5563] mt-1">
          Foto veya video yükle → öğrenciye ata → nakit ödeme sonrası indirilebilir işaretle.
        </p>
      </header>

      <MediaUploader students={(students ?? []).map((s) => ({ id: String(s.id), name: String(s.name) }))} />

      <section>
        <h2 className="font-semibold text-[#07283b] mb-3">Yüklenmiş Medya ({media?.length ?? 0})</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#eef1f4] text-[#8497a1] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Öğrenci</th>
                <th className="px-4 py-3 text-left">Tip</th>
                <th className="px-4 py-3 text-left">Anahtar</th>
                <th className="px-4 py-3 text-left">Tarih</th>
                <th className="px-4 py-3 text-left">İndirilebilir</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e9ee]">
              {(media ?? []).map((m) => {
                const studentName = (m.students as unknown as { name?: string } | null)?.name ?? '—';
                return (
                  <MediaRow
                    key={String(m.id)}
                    id={String(m.id)}
                    studentId={String(m.student_id ?? '')}
                    studentName={studentName}
                    type={String(m.type)}
                    r2Key={String(m.r2_key)}
                    downloadable={!!m.downloadable}
                    createdAt={String(m.created_at)}
                  />
                );
              })}
              {(!media || media.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#8497a1]">
                    Henüz medya yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
