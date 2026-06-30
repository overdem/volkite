import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import { logout } from '../actions';
import AdminNav from '../AdminNav';
import HocaTabBar from '../HocaTabBar';

export const metadata: Metadata = { title: 'Volkite Panel', robots: 'noindex' };

async function getPendingCount() {
  try {
    const db = createAdminClient();
    const { count } = await db
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'provisional');
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { userId, email, role, active } = await getUserRole();

  if (!userId) redirect('/panel/login');
  if (!active || !role) redirect('/panel/login');
  if (role === 'student') redirect('/ogrenci');
  // role: 'admin' | 'instructor'

  if (role === 'instructor') {
    return (
      <div className="min-h-screen flex flex-col font-body bg-[#eef1f4]">
        <header className="bg-[#062131] text-[#dceaf0] px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-display text-lg tracking-wider text-[#14b8cf]">VOLKITE</span>
            <p className="text-[10px] text-[#9fc0cf] -mt-0.5">Hoca Paneli</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-xs text-[#9fc0cf]">Çıkış</button>
          </form>
        </header>
        <main className="flex-1 pb-20 overflow-auto">{children}</main>
        <HocaTabBar />
      </div>
    );
  }

  // role === 'admin'
  const pendingCount = await getPendingCount();
  return (
    <div className="h-full flex font-body bg-[#eef1f4]">
      <aside className="w-56 shrink-0 flex flex-col bg-[#062131] text-[#dceaf0]">
        <div className="px-5 py-6 border-b border-white/10">
          <span className="font-display text-xl tracking-wider text-[#14b8cf]">VOLKITE</span>
          <p className="text-xs text-[#9fc0cf] mt-0.5">Admin Paneli</p>
        </div>

        <AdminNav pendingCount={pendingCount} />

        <div className="px-4 py-4 border-t border-white/10 text-xs text-[#5a7079]">
          <p className="truncate mb-2">{email}</p>
          <form action={logout}>
            <button type="submit" className="text-[#9fc0cf] hover:text-white transition-colors">
              Çıkış
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
