import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import { logout } from '../actions';
import AdminShell from '../AdminShell';
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
    <AdminShell email={email} pendingCount={pendingCount}>
      {children}
    </AdminShell>
  );
}
