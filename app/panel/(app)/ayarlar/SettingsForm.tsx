'use client';

import { useState, useTransition } from 'react';
import { updateSiteSettings, updateWindBand } from '../../actions';

type Settings = Record<string, unknown>;
type WindBand = { level: string; min_kn: number; max_kn: number; max_gust_kn: number; ideal_kn: number; note_tr: string | null };

export default function SettingsForm({ settings, bands }: { settings: Settings | null; bands: WindBand[] }) {
  return (
    <div className="space-y-6">
      <SiteSettingsSection settings={settings} />
      <WindBandsSection bands={bands} />
    </div>
  );
}

function SiteSettingsSection({ settings }: { settings: Settings | null }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((v, k) => { data[k] = v !== '' ? v : null; });
    if (data['daily_slots']) data['daily_slots'] = Number(data['daily_slots']);
    if (data['windy_days']) data['windy_days'] = Number(data['windy_days']);
    startTransition(async () => {
      await updateSiteSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const fields: [string, string, string][] = [
    ['phone', 'Telefon / WhatsApp', 'text'],
    ['email', 'E-posta', 'email'],
    ['season_tr', 'Sezon (TR)', 'text'],
    ['season_en', 'Sezon (EN)', 'text'],
    ['windy_days', 'Rüzgârlı Gün / Yıl', 'number'],
    ['daily_slots', 'Günlük Slot Kapasitesi', 'number'],
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold text-[#07283b] mb-4">Site Ayarları</h2>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(([name, label, type]) => (
          <div key={name}>
            <label className="block text-xs text-[#8497a1] mb-1">{label}</label>
            <input
              name={name}
              type={type}
              defaultValue={settings?.[name] as string ?? ''}
              className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#14b8cf]"
            />
          </div>
        ))}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-4 px-6 py-2 bg-[#14b8cf] text-[#062131] font-semibold rounded-lg text-sm hover:bg-[#0fa3b8] disabled:opacity-60 transition-colors"
      >
        {saved ? '✓ Kaydedildi' : pending ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  );
}

const LEVEL_TR: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

function WindBandsSection({ bands }: { bands: WindBand[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold text-[#07283b] mb-1">Rüzgâr Bantları</h2>
      <p className="text-xs text-[#8497a1] mb-4">Seviyeye göre rüzgâr eşikleri (knot). Bu değerlere göre ajan gün önerir.</p>
      <div className="space-y-4">
        {bands.map((b) => (
          <WindBandRow key={b.level} band={b} />
        ))}
      </div>
    </div>
  );
}

function WindBandRow({ band }: { band: WindBand }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((v, k) => { data[k] = k === 'note_tr' ? v : Number(v); });
    startTransition(async () => {
      await updateWindBand(band.level, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#e4e9ee] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium text-sm text-[#07283b]">{LEVEL_TR[band.level] ?? band.level}</span>
        <button
          type="submit"
          disabled={pending}
          className="text-xs px-3 py-1 bg-[#eef1f4] text-[#07283b] rounded-lg hover:bg-[#e4e9ee] disabled:opacity-60 transition-colors"
        >
          {saved ? '✓' : pending ? '…' : 'Kaydet'}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {([['min_kn', 'Min (kn)'], ['max_kn', 'Max (kn)'], ['max_gust_kn', 'Max Hamle (kn)'], ['ideal_kn', 'İdeal (kn)']] as [string, string][]).map(([name, label]) => (
          <div key={name}>
            <label className="block text-xs text-[#8497a1] mb-1">{label}</label>
            <input
              name={name}
              type="number"
              step="0.5"
              defaultValue={band[name as keyof WindBand] as number}
              className="w-full border border-[#e4e9ee] rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#14b8cf]"
            />
          </div>
        ))}
      </div>
    </form>
  );
}
