import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase-server';

async function getStudents() {
  const db = createAdminClient();
  const { data } = await db
    .from('students')
    .select('id, name, contact, level, status, created_at, language')
    .order('created_at', { ascending: false });
  return data ?? [];
}

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
const LEVEL_TR: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

export default async function OgrencilerPage() {
  const students = await getStudents();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#07283b]">Öğrenciler</h1>
        <span className="text-sm text-[#8497a1]">{students.length} kayıt</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
              <tr key={s.id} className="hover:bg-[#f5f7f9]">
                <td className="px-6 py-3 font-medium text-[#07283b]">{s.name}</td>
                <td className="px-6 py-3 text-[#3a5563]">{LEVEL_TR[s.level] ?? s.level ?? '—'}</td>
                <td className="px-6 py-3 text-[#3a5563]">{s.contact ?? '—'}</td>
                <td className="px-6 py-3 text-[#3a5563] uppercase">{s.language ?? '—'}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[s.status] ?? ''}`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-[#8497a1]">
                  {new Date(s.created_at as string).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-6 py-3 text-right">
                  <Link
                    href={`/panel/ogrenciler/${s.id}`}
                    className="text-[#14b8cf] hover:underline text-xs font-medium"
                  >
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
