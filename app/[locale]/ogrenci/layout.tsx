import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAuthClient } from '@/lib/supabase-server';
import { logout } from '@/app/panel/actions';

export default async function OgrenciLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/ogrenci/login');

  return (
    <div className="min-h-screen bg-[#eef1f4]">
      <header className="bg-[#062131] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg tracking-widest text-[#14b8cf]">VOLKITE</span>
          <nav className="flex gap-4 text-sm text-[#9fc0cf]">
            <Link href="/ogrenci" className="hover:text-white transition-colors">
              Derslerim
            </Link>
            <Link href="/ogrenci/medya" className="hover:text-white transition-colors">
              Medyam
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#9fc0cf] truncate max-w-[200px]">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="text-[#9fc0cf] hover:text-white transition-colors">
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
