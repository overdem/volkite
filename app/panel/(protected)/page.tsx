import { createAdminClient } from '@/lib/supabase-server';

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

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentBookings()]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#07283b] mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Aktif Öğrenci" value={stats.activeStudents} />
        <StatCard label="Bekleyen Ön Kayıt" value={stats.pendingBookings} highlight />
        <StatCard label="Son 30 Gün Onay" value={stats.confirmedLast30} />
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
