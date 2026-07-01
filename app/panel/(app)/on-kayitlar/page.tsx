import { redirect } from 'next/navigation';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';
import { waLink } from '@/lib/phone';
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
  const { role } = await getUserRole();
  if (role !== 'admin') redirect('/panel');
  const bookings = await getBookings();

  return (
    <div className="p-4 md:p-8">
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
                        {LEVEL_TR[b.level] ?? b.level ?? '—'} &middot; {b.language?.toUpperCase() ?? '?'}
                      </p>
                      {b.contact && (() => {
                        const wa = waLink(b.contact, `Merhaba ${b.name ?? ''}, Volkite ön kaydın hakkında yazıyorum.`);
                        return wa ? (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 bg-[#25D366] text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:brightness-95"
                          >
                            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884" /></svg>
                            {b.contact}
                          </a>
                        ) : (
                          <p className="text-sm text-[#3a5563] mt-1">{b.contact}</p>
                        );
                      })()}
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
