import { redirect } from 'next/navigation';
import { createAuthClient, createAdminClient } from '@/lib/supabase-server';
import { logout } from '../actions';
import PanelNav from '../PanelNav';
import type { Metadata } from 'next';

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
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/panel/login');

  const pendingCount = await getPendingCount();

  return (
    <html lang="tr" className="h-full">
      <body className="h-full flex font-body antialiased bg-[#eef1f4]">
        <aside className="w-56 shrink-0 flex flex-col bg-[#062131] text-[#dceaf0]">
          <div className="px-5 py-6 border-b border-white/10">
            <span className="font-display text-xl tracking-wider text-[#14b8cf]">VOLKITE</span>
            <p className="text-xs text-[#9fc0cf] mt-0.5">Hoca Paneli</p>
          </div>

          <PanelNav pendingCount={pendingCount} />

          <div className="px-4 py-4 border-t border-white/10 text-xs text-[#5a7079]">
            <p className="truncate mb-2">{user.email}</p>
            <form action={logout}>
              <button type="submit" className="text-[#9fc0cf] hover:text-white transition-colors">
                Çıkış
              </button>
            </form>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
