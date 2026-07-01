'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminNav, { NAV } from './AdminNav';
import { logout } from './actions';

export default function AdminShell({
  email,
  pendingCount,
  children,
}: {
  email: string | null;
  pendingCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeLabel =
    [...NAV].sort((a, b) => b.href.length - a.href.length).find((n) =>
      n.exact ? pathname === n.href : pathname.startsWith(n.href)
    )?.label ?? 'VOLKITE';

  return (
    <div className="min-h-screen md:h-full md:flex font-body bg-[#eef1f4]">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-[#07283b] text-[#dceaf0] px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          aria-label="Menüyü aç"
          className="flex flex-col gap-1.5 p-1"
        >
          <span className="block w-5 h-0.5 bg-[#dceaf0] rounded" />
          <span className="block w-5 h-0.5 bg-[#dceaf0] rounded" />
          <span className="block w-5 h-0.5 bg-[#dceaf0] rounded" />
        </button>
        <span className="font-bold text-[#dceaf0]">{activeLabel}</span>
        {pendingCount > 0 ? (
          <span className="bg-[#14b8cf] text-[#062131] text-xs font-bold px-1.5 py-0.5 rounded-full">
            {pendingCount}
          </span>
        ) : (
          <span className="w-6" />
        )}
      </header>

      {/* Overlay (mobile, when drawer open) */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar / drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 md:w-56 shrink-0 flex flex-col bg-[#07283b] text-[#dceaf0] transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <span className="font-display text-xl tracking-wider text-[#14b8cf]">VOLKITE</span>
            <p className="text-xs text-[#9fc0cf] mt-0.5">Admin Paneli</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
            className="md:hidden text-[#9fc0cf] text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AdminNav pendingCount={pendingCount} onNavigate={() => setOpen(false)} />
        </div>

        <div className="px-4 py-4 border-t border-white/10 text-xs text-[#5a7079]">
          <p className="truncate mb-2">{email}</p>
          <form action={logout}>
            <button type="submit" className="text-[#9fc0cf] hover:text-white transition-colors">
              Çıkış
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
