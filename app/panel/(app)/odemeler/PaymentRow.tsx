'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { togglePaymentPaid } from '../../actions';

type Props = {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  method: string;
  amount: number;
  paid: boolean;
  paidAt: string | null;
};

export default function PaymentRow({ id, studentId, studentName, type, method, amount, paid, paidAt }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await togglePaymentPaid(id, !paid, studentId);
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-[#f5f7f9]">
      <td className="px-4 py-3 font-medium text-[#07283b]">{studentName}</td>
      <td className="px-4 py-3 text-[#3a5563] capitalize">{type}</td>
      <td className="px-4 py-3 text-[#3a5563] capitalize">{method}</td>
      <td className="px-4 py-3 text-right font-bold text-[#07283b]">{amount.toFixed(0)} €</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
            paid
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
        >
          {paid ? 'Tahsil edildi ✓' : 'Bekliyor'}
        </button>
      </td>
      <td className="px-4 py-3 text-xs text-[#8497a1]">
        {paidAt ? new Date(paidAt).toLocaleDateString('tr-TR') : '—'}
      </td>
    </tr>
  );
}
