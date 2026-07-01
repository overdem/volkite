import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import HocaToday from './_views/HocaToday';
import TodaySchedule from './_views/TodaySchedule';

async function getStats() {
  const db = createAdminClient();
  const [students, provisional, confirmed] = await Promise.all([
    db.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'provisional'),
    db.from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);
  return {
    activeStudents: students.count ?? 0,
    pendingBookings: provisional.count ?? 0,
    confirmedLast30: confirmed.count ?? 0,
  };
}

async function getInstructorLoad() {
  const db = createAdminClient();
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const [{ data: profs }, { data: sess }] = await Promise.all([
    db.from('profiles').select('id, name').eq('active', true).in('role', ['admin', 'instructor']).order('name'),
    db.from('sessions').select('instructor_id').eq('status', 'planned').gte('scheduled_at', from.toISOString()),
  ]);
  const counts = new Map<string, number>();
  (sess ?? []).forEach((s) => {
    if (s.instructor_id) {
      const k = String(s.instructor_id);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  });
  return (profs ?? []).map((p) => ({
    id: String(p.id),
    name: String(p.name ?? '—'),
    count: counts.get(String(p.id)) ?? 0,
  }));
}

async function getRecentBookings() {
  const db = createAdminClient();
  const { data } = await db
    .from('bookings')
    .select('id, name, level, contact, requested_start, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return data ?? [];
}

const STATUS_LABEL: Record<string, string> = {
  provisional: 'Bekliyor',
  confirmed: 'Onaylı',
  cancelled: 'İptal',
};
const STATUS_COLOR: Record<string, string> = {
  provisional: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default async function PanelHomePage() {
  const { role, userId } = await getUserRole();

  if (role === 'instructor' && userId) {
    return <HocaToday instructorId={userId} />;
  }

  // admin → Dashboard
  const [stats, recent, load] = await Promise.all([getStats(), getRecentBookings(), getInstructorLoad()]);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#07283b]">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Aktif Öğrenci" value={stats.activeStudents} />
        <StatCard label="Bekleyen Ön Kayıt" value={stats.pendingBookings} highlight />
        <StatCard label="Son 30 Gün Onay" value={stats.confirmedLast30} />
      </div>

      <TodaySchedule />

      {load.length > 0 && (
        <section className="bg-white rounded-2xl p-4 md:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#3a5563] uppercase tracking-wider mb-3">Hoca Yükü (bugünden itibaren planlı)</h2>
          <div className="space-y-1.5">
            {load.map((i) => (
              <div key={i.id} className="flex items-center justify-between text-sm">
                <span className="text-[#07283b]">{i.name}</span>
                <span className="text-[#8497a1]">{i.count} planlı</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <div className="px-6 py-4 border-b border-[#e4e9ee]">
          <h2 className="font-semibold text-[#07283b]">Son Ön Kayıtlar</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#eef1f4] text-[#8497a1] text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Ad</th>
              <th className="px-6 py-3 text-left">Seviye</th>
              <th className="px-6 py-3 text-left">Tarih</th>
              <th className="px-6 py-3 text-left">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e9ee]">
            {recent.map((b) => (
              <tr key={b.id} className="hover:bg-[#f5f7f9]">
                <td className="px-6 py-3 font-medium text-[#07283b]">{b.name}</td>
                <td className="px-6 py-3 text-[#3a5563] capitalize">{b.level ?? '—'}</td>
                <td className="px-6 py-3 text-[#3a5563]">{b.requested_start ?? '—'}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[b.status] ?? ''}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-6 text-center text-[#8497a1]">
                  Henüz ön kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm ${highlight ? 'bg-[#14b8cf]/10 border border-[#14b8cf]/30' : 'bg-white'}`}>
      <p className="text-xs text-[#8497a1] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold ${highlight ? 'text-[#14b8cf]' : 'text-[#07283b]'}`}>
        {value}
      </p>
    </div>
  );
}
