import { createAdminClient } from '@/lib/supabase-server';
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
  const { settings, bands } = await getData();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-[#07283b] mb-6">Ayarlar</h1>
      <SettingsForm settings={settings} bands={bands} />
    </div>
  );
}
