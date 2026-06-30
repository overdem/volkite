'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/panel', label: 'Bugün', exact: true, icon: '☀' },
  { href: '/panel/takvim', label: 'Takvim', icon: '📅' },
  { href: '/panel/ogrenciler', label: 'Öğrenciler', icon: '👥' },
  { href: '/panel/ayarlar', label: 'Hesap', icon: '⚙' },
];

export default function HocaTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-[#062131] border-t border-white/10 flex justify-around"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ href, label, exact, icon }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2.5 text-xs ${
              active ? 'text-[#14b8cf]' : 'text-[#9fc0cf]'
            }`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="mt-1 font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
