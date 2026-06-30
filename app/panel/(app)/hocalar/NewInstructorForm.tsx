'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createInstructor } from '../../actions';

export default function NewInstructorForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [ok, setOk] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setOk(false);
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createInstructor(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setOk(true);
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="font-semibold text-[#07283b]">Yeni Hoca Ekle</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field name="name" label="Ad" required />
        <Field name="email" label="E-posta" type="email" required />
        <Field name="password" label="Şifre (min 8)" type="password" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-700">Hoca eklendi ✓</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-[#14b8cf] text-[#062131] font-bold px-5 py-2 rounded-lg text-sm hover:bg-[#0fa3b8] disabled:opacity-60"
      >
        {pending ? 'Ekleniyor…' : 'Hoca Ekle'}
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-[#8497a1] mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white"
        autoComplete="off"
      />
    </div>
  );
}
