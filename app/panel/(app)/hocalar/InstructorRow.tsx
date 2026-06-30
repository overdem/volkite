'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleInstructorActive, deleteInstructor } from '../../actions';

type Props = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  studentCount: number;
};

export default function InstructorRow({ id, name, email, role, active, studentCount }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleInstructorActive(id, !active);
      router.refresh();
    });
  }

  function del() {
    if (role === 'admin') {
      alert('Admin silinemez. Önce rolünü hoca yapın.');
      return;
    }
    if (!confirm(`${name} silinsin mi? Atandığı öğrencilerin ataması kaldırılır.`)) return;
    startTransition(async () => {
      await deleteInstructor(id);
      router.refresh();
    });
  }

  return (
    <tr className="hover:bg-[#f5f7f9]">
      <td className="px-4 py-3 font-medium text-[#07283b]">{name}</td>
      <td className="px-4 py-3 text-[#3a5563]">{email}</td>
      <td className="px-4 py-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
          {role === 'admin' ? 'Admin' : 'Hoca'}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-[#3a5563]">{studentCount}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {active ? 'Aktif' : 'Pasif'}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        {role !== 'admin' && (
          <button type="button" onClick={del} disabled={pending} className="text-xs text-red-600 hover:text-red-800">
            Sil
          </button>
        )}
      </td>
    </tr>
  );
}
