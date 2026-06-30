'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/panel', label: 'Dashboard', exact: true },
  { href: '/panel/takvim', label: 'Takvim' },
  { href: '/panel/on-kayitlar', label: 'Ön Kayıtlar' },
  { href: '/panel/ogrenciler', label: 'Öğrenciler' },
  { href: '/panel/hocalar', label: 'Hocalar' },
  { href: '/panel/odemeler', label: 'Ödemeler' },
  { href: '/panel/medya', label: 'Medya' },
  { href: '/panel/ayarlar', label: 'Ayarlar' },
];

export default function AdminNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 text-sm">
      {NAV.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              active
                ? 'bg-[#14b8cf]/15 text-white'
                : 'text-[#9fc0cf] hover:bg-white/8 hover:text-white'
            }`}
          >
            {label}
            {href === '/panel/on-kayitlar' && pendingCount > 0 && (
              <span className="ml-auto bg-[#14b8cf] text-[#062131] text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
