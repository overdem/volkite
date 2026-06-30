import { redirect } from 'next/navigation';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import InstructorRow from './InstructorRow';
import NewInstructorForm from './NewInstructorForm';

export default async function HocalarPage() {
  const { role } = await getUserRole();
  if (role !== 'admin') redirect('/panel');

  const db = createAdminClient();
  const { data: profiles } = await db
    .from('profiles')
    .select('id, name, role, active')
    .order('role')
    .order('name');

  // Auth tablosundan email'leri al
  const { data: usersList } = await db.auth.admin.listUsers();
  const emailById = new Map<string, string>();
  (usersList?.users ?? []).forEach((u) => {
    if (u.id && u.email) emailById.set(u.id, u.email);
  });

  // Her hoca için atanmış öğrenci sayısı
  const ids = (profiles ?? []).map((p) => String(p.id));
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: students } = await db
      .from('students')
      .select('assigned_instructor', { count: 'exact' });
    (students ?? []).forEach((s) => {
      const k = String(s.assigned_instructor ?? '');
      if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
    });
  }

  return (
    <div className="p-8 space-y-8">
      <header>
        <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Hocalar</p>
        <h1 className="text-2xl font-bold text-[#07283b]">Personel Yönetimi</h1>
      </header>

      <NewInstructorForm />

      <section>
        <h2 className="font-semibold text-[#07283b] mb-3">Tüm Personel ({profiles?.length ?? 0})</h2>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#eef1f4] text-[#8497a1] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Ad</th>
                <th className="px-4 py-3 text-left">E-posta</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-right">Öğrenci</th>
                <th className="px-4 py-3 text-left">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e9ee]">
              {(profiles ?? []).map((p) => (
                <InstructorRow
                  key={String(p.id)}
                  id={String(p.id)}
                  name={String(p.name ?? '—')}
                  email={emailById.get(String(p.id)) ?? '—'}
                  role={String(p.role)}
                  active={p.active !== false}
                  studentCount={counts.get(String(p.id)) ?? 0}
                />
              ))}
              {(!profiles || profiles.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#8497a1]">Personel yok.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
