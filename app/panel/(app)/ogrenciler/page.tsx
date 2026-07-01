import Link from 'next/link';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import { levelLabel, levelShort, levelColor } from '@/lib/level';
import NewStudentForm from './NewStudentForm';

const STATUS_LABEL: Record<string, string> = {
  prospect: 'Aday',
  active: 'Aktif',
  completed: 'Tamamladı',
};
const STATUS_COLOR: Record<string, string> = {
  prospect: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
};

export default async function OgrencilerPage() {
  const { role, userId } = await getUserRole();
  const isInstructor = role === 'instructor';

  const db = createAdminClient();
  let q = db
    .from('students')
    .select('id, name, contact, level, status, created_at, language, assigned_instructor')
    .order('created_at', { ascending: false });
  if (isInstructor && userId) q = q.eq('assigned_instructor', userId);
  const { data } = await q;
  const students = data ?? [];

  // Hocalar listesi (admin atama için)
  const { data: instructors } = role === 'admin'
    ? await db.from('profiles').select('id, name').eq('active', true).order('name')
    : { data: [] };

  if (isInstructor) {
    // Mobile-first list
    return (
      <div className="p-4 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Öğrencilerim</p>
            <p className="text-sm text-[#8497a1]">{students.length} kayıt</p>
          </div>
        </header>

        <NewStudentForm
          isInstructor
          instructors={[]}
          selfId={userId ?? ''}
        />

        <ul className="space-y-2">
          {students.map((s) => (
            <li key={String(s.id)}>
              <Link
                href={`/panel/ogrenciler/${String(s.id)}`}
                className="block bg-white rounded-2xl p-4 shadow-sm active:opacity-70"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${levelColor(String(s.level ?? ''))}`}>
                      {levelShort(String(s.level ?? ''))}
                    </span>
                    <h3 className="font-bold text-[#07283b]">{String(s.name)}</h3>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[String(s.status)] ?? ''}`}>
                    {STATUS_LABEL[String(s.status)] ?? String(s.status)}
                  </span>
                </div>
                <p className="text-xs text-[#3a5563] mt-0.5">
                  {levelLabel(String(s.level ?? ''))} · {String(s.contact ?? '—')}
                </p>
              </Link>
            </li>
          ))}
          {students.length === 0 && (
            <li className="bg-white rounded-2xl p-6 text-center text-[#8497a1] text-sm">
              Henüz size atanmış öğrenci yok.
            </li>
          )}
        </ul>
      </div>
    );
  }

  // Admin desktop tablo
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#07283b]">Öğrenciler</h1>
        <span className="text-sm text-[#8497a1]">{students.length} kayıt</span>
      </div>

      <NewStudentForm
        isInstructor={false}
        instructors={(instructors ?? []).map((p) => ({ id: String(p.id), name: String(p.name ?? '—') }))}
        selfId={userId ?? ''}
      />

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#eef1f4] text-[#8497a1] text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Ad</th>
              <th className="px-6 py-3 text-left">Seviye</th>
              <th className="px-6 py-3 text-left">İletişim</th>
              <th className="px-6 py-3 text-left">Dil</th>
              <th className="px-6 py-3 text-left">Durum</th>
              <th className="px-6 py-3 text-left">Kayıt</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e9ee]">
            {students.map((s) => (
              <tr key={String(s.id)} className="hover:bg-[#f5f7f9]">
                <td className="px-6 py-3 font-medium text-[#07283b]">
                  <span className="inline-flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${levelColor(String(s.level ?? ''))}`}>
                      {levelShort(String(s.level ?? ''))}
                    </span>
                    {String(s.name)}
                  </span>
                </td>
                <td className="px-6 py-3 text-[#3a5563]">{levelLabel(String(s.level ?? ''))}</td>
                <td className="px-6 py-3 text-[#3a5563]">{String(s.contact ?? '—')}</td>
                <td className="px-6 py-3 text-[#3a5563] uppercase">{String(s.language ?? '—')}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[String(s.status)] ?? ''}`}>
                    {STATUS_LABEL[String(s.status)] ?? String(s.status)}
                  </span>
                </td>
                <td className="px-6 py-3 text-[#8497a1]">
                  {new Date(s.created_at as string).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-3 text-right">
                  <Link href={`/panel/ogrenciler/${String(s.id)}`} className="text-[#14b8cf] hover:underline text-xs font-medium">
                    Detay →
                  </Link>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[#8497a1]">
                  Henüz öğrenci yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
