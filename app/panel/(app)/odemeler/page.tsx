import { redirect } from 'next/navigation';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import PaymentRow from './PaymentRow';

type SearchParams = { paid?: string };

export default async function OdemelerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { role } = await getUserRole();
  if (role !== 'admin') redirect('/panel');

  const { paid } = await searchParams;

  const db = createAdminClient();
  let q = db
    .from('payments')
    .select('id, student_id, amount_eur, type, method, paid, paid_at, notes, students(name)')
    .order('paid_at', { ascending: false, nullsFirst: false })
    .limit(500);
  if (paid === 'yes') q = q.eq('paid', true);
  if (paid === 'no') q = q.eq('paid', false);

  const { data: rows } = await q;

  const totalPaid = (rows ?? []).filter((r) => r.paid).reduce((s, r) => s + Number(r.amount_eur ?? 0), 0);
  const totalDue = (rows ?? []).filter((r) => !r.paid).reduce((s, r) => s + Number(r.amount_eur ?? 0), 0);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Ödemeler</p>
        <h1 className="text-2xl font-bold text-[#07283b]">Tüm Ödemeler</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card label="Tahsil Edildi" value={`${totalPaid.toFixed(0)} €`} color="text-green-700" />
        <Card label="Bekleyen" value={`${totalDue.toFixed(0)} €`} color="text-yellow-700" />
        <Card label="Kayıt Sayısı" value={String(rows?.length ?? 0)} color="text-[#07283b]" />
      </div>

      <div className="flex gap-2 text-sm">
        <Filter href="/panel/odemeler" label="Tümü" active={!paid} />
        <Filter href="/panel/odemeler?paid=no" label="Bekleyen" active={paid === 'no'} />
        <Filter href="/panel/odemeler?paid=yes" label="Tahsil Edildi" active={paid === 'yes'} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#eef1f4] text-[#8497a1] text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Öğrenci</th>
              <th className="px-4 py-3 text-left">Tip</th>
              <th className="px-4 py-3 text-left">Yöntem</th>
              <th className="px-4 py-3 text-right">Tutar</th>
              <th className="px-4 py-3 text-left">Durum</th>
              <th className="px-4 py-3 text-left">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e4e9ee]">
            {(rows ?? []).map((r) => {
              const name = (r.students as unknown as { name?: string } | null)?.name ?? '—';
              return (
                <PaymentRow
                  key={String(r.id)}
                  id={String(r.id)}
                  studentId={String(r.student_id ?? '')}
                  studentName={name}
                  type={String(r.type ?? '—')}
                  method={String(r.method ?? '—')}
                  amount={Number(r.amount_eur ?? 0)}
                  paid={!!r.paid}
                  paidAt={r.paid_at as string | null}
                />
              );
            })}
            {(!rows || rows.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[#8497a1]">
                  Kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-[#8497a1] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Filter({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
        active ? 'bg-[#14b8cf] text-[#062131]' : 'bg-white text-[#3a5563] border border-[#e4e9ee]'
      }`}
    >
      {label}
    </a>
  );
}
