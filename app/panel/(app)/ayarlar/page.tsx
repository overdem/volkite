import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import { logout } from '../../actions';
import SettingsForm from './SettingsForm';

async function getData() {
  const db = createAdminClient();
  const [settings, bands] = await Promise.all([
    db.from('site_settings').select('*').eq('id', 1).single(),
    db.from('wind_bands').select('*').order('level'),
  ]);
  return { settings: settings.data, bands: bands.data ?? [] };
}

export default async function AyarlarPage() {
  const { role, email } = await getUserRole();

  // Hoca için minimal hesap ekranı
  if (role === 'instructor') {
    return (
      <div className="p-4 space-y-4">
        <header>
          <p className="text-xs uppercase tracking-wider text-[#14b8cf] font-bold">Hesap</p>
          <h1 className="text-xl font-bold text-[#07283b]">Hesap Ayarları</h1>
        </header>
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-1">
          <p className="text-xs text-[#8497a1] uppercase">E-posta</p>
          <p className="text-sm text-[#07283b]">{email ?? '—'}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full bg-white border border-red-200 text-red-600 font-bold px-5 py-3 rounded-2xl text-sm"
          >
            Çıkış Yap
          </button>
        </form>
      </div>
    );
  }

  // Admin: tam ayarlar
  const { settings, bands } = await getData();
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold text-[#07283b] mb-6">Ayarlar</h1>
      <SettingsForm settings={settings} bands={bands} />
    </div>
  );
}
