import { createAdminClient } from '@/lib/supabase-server';
import BookingActions from './BookingActions';

async function getBookings() {
  const db = createAdminClient();
  const { data } = await db
    .from('bookings')
    .select('*')
    .eq('status', 'provisional')
    .order('created_at', { ascending: false });
  return data ?? [];
}

const LEVEL_TR: Record<string, string> = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
};

const LABEL_TR: Record<string, string> = {
  ideal: '✅ İdeal',
  uygun: '🟡 Uygun',
  zayif: '⬇️ Zayıf',
  sert: '⚠️ Sert',
  mevsimsel: '📅 Mevsimsel',
};

export default async function OnKayitlarPage() {
  const bookings = await getBookings();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#07283b]">Ön Kayıtlar</h1>
        <span className="text-sm text-[#8497a1]">
          {bookings.length} bekleyen kayıt
        </span>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#8497a1] shadow-sm">
          Bekleyen ön kayıt yok 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const windMatch = (b.wind_match as Record<string, { avg_kn: number; label: string }> | null) ?? {};
            const proposedDates: string[] = Array.isArray(b.proposed_dates) ? b.proposed_dates : [];

            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-[#07283b]">{b.name}</h2>
                      <p className="text-sm text-[#8497a1] mt-0.5">
                        {LEVEL_TR[b.level] ?? b.level ?? '—'} &middot; {b.language?.toUpperCase() ?? '?'} &middot;{' '}
                        {b.contact ?? '—'}
                      </p>
                    </div>
                    <p className="text-xs text-[#8497a1] shrink-0">
                      {new Date(b.created_at as string).toLocaleDateString('tr-TR')}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-[#8497a1] mb-1">İstenen tarih aralığı</p>
                      <p className="text-[#07283b]">
                        {b.requested_start} → {b.requested_end}
                        {b.days_needed ? ` (${b.days_needed} gün)` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8497a1] mb-1">Konaklama</p>
                      <p className="text-[#07283b]">{b.accommodation_needed ? 'Gerekli' : 'Yok'}</p>
                    </div>
                  </div>

                  {proposedDates.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-[#8497a1] mb-2">Ajanın önerdiği günler</p>
                      <div className="flex flex-wrap gap-2">
                        {proposedDates.map((d) => {
                          const info = windMatch[d];
                          return (
                            <span
                              key={d}
                              className="inline-flex items-center gap-1.5 bg-[#eef1f4] rounded-lg px-3 py-1 text-xs text-[#07283b]"
                            >
                              <span className="font-medium">{d}</span>
                              {info && (
                                <>
                                  <span className="text-[#8497a1]">{info.avg_kn}kn</span>
                                  <span>{LABEL_TR[info.label] ?? info.label}</span>
                                </>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {b.notes && (
                    <p className="mt-3 text-sm text-[#3a5563] bg-[#eef1f4] rounded-lg px-3 py-2">
                      {b.notes}
                    </p>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-[#e4e9ee] bg-[#f9fafb] flex gap-3">
                  <BookingActions bookingId={b.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
