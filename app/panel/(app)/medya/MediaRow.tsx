'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setMediaDownloadable, deleteMedia } from '../../actions';

type Props = {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  r2Key: string;
  downloadable: boolean;
  createdAt: string;
};

export default function MediaRow({ id, studentName, type, r2Key, downloadable, createdAt }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await setMediaDownloadable(id, !downloadable);
      router.refresh();
    });
  }
  function del() {
    if (!confirm('Bu medya silinsin mi? Geri alınamaz.')) return;
    startTransition(async () => {
      await deleteMedia(id);
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-[#f5f7f9]">
      <td className="px-4 py-3 font-medium text-[#07283b]">{studentName}</td>
      <td className="px-4 py-3 text-[#3a5563] capitalize">{type}</td>
      <td className="px-4 py-3 text-xs text-[#8497a1] font-mono truncate max-w-xs">{r2Key}</td>
      <td className="px-4 py-3 text-xs text-[#8497a1]">{new Date(createdAt).toLocaleDateString('tr-TR')}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
            downloadable
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
        >
          {downloadable ? 'Açık ✓' : 'Kilitli'}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={del}
          disabled={pending}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Sil
        </button>
      </td>
    </tr>
  );
}
