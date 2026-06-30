'use client';

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { approveBooking, rejectBooking } from '../../actions';

export default function BookingActions({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      const result = await approveBooking(bookingId);
      if (result.ok) router.push(`/panel/ogrenciler/${result.studentId}`);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectBooking(bookingId, rejectReason);
      setShowReject(false);
    });
  }

  if (showReject) {
    return (
      <div className="flex items-center gap-2 w-full">
        <input
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="İptal sebebi (opsiyonel)"
          className="flex-1 border border-[#e4e9ee] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#14b8cf]"
        />
        <button
          onClick={handleReject}
          disabled={pending}
          className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
        >
          {pending ? '…' : 'Onayla İptal'}
        </button>
        <button
          onClick={() => setShowReject(false)}
          className="px-4 py-1.5 text-sm text-[#8497a1] hover:text-[#07283b] transition-colors"
        >
          Vazgeç
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleApprove}
        disabled={pending}
        className="px-5 py-2 text-sm font-semibold bg-[#14b8cf] text-[#062131] rounded-lg hover:bg-[#0fa3b8] disabled:opacity-60 transition-colors"
      >
        {pending ? 'İşleniyor…' : '✓ Onayla & Öğrenci Oluştur'}
      </button>
      <button
        onClick={() => setShowReject(true)}
        disabled={pending}
        className="px-5 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
      >
        Reddet
      </button>
    </>
  );
}
