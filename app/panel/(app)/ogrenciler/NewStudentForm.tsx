'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createStudentForInstructor } from '../../actions';

type Props = {
  isInstructor: boolean;
  instructors: Array<{ id: string; name: string }>;
  selfId: string;
};

export default function NewStudentForm({ isInstructor, instructors, selfId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (isInstructor) fd.set('assigned_instructor', selfId);
    startTransition(async () => {
      const res = await createStudentForInstructor(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      form.reset();
      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`bg-[#14b8cf] text-[#062131] font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-[#0fa3b8] ${
          isInstructor ? 'w-full' : ''
        }`}
      >
        + Yeni Öğrenci
      </button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#07283b]">Yeni Öğrenci</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#8497a1]">İptal</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <F name="name" label="Ad Soyad" required />
        <F name="contact" label="Telefon" />
        <F name="email" label="E-posta" type="email" />
        <F name="birth_date" label="Doğum Tarihi" type="date" />
        <F name="weight_kg" label="Kilo (kg)" type="number" />
        <Sel name="gender" label="Cinsiyet" options={[
          { value: '', label: 'Belirtilmedi' },
          { value: 'male', label: 'Erkek' },
          { value: 'female', label: 'Kadın' },
          { value: 'other', label: 'Diğer' },
        ]} />
        <Sel name="level" label="Seviye" options={[
          { value: '', label: 'Seç…' },
          { value: 'beginner', label: 'Başlangıç' },
          { value: 'intermediate', label: 'Orta' },
          { value: 'advanced', label: 'İleri' },
        ]} />
        <Sel name="language" label="Dil" options={[
          { value: '', label: 'Seç…' },
          { value: 'tr', label: 'Türkçe' },
          { value: 'en', label: 'İngilizce' },
          { value: 'bg', label: 'Bulgarca' },
          { value: 'ro', label: 'Romence' },
        ]} />
        {!isInstructor && (
          <Sel name="assigned_instructor" label="Atanan Hoca" options={[
            { value: '', label: 'Yok' },
            ...instructors.map((i) => ({ value: i.id, label: i.name })),
          ]} />
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-[#14b8cf] text-[#062131] font-bold px-5 py-2 rounded-lg text-sm hover:bg-[#0fa3b8] disabled:opacity-60"
      >
        {pending ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  );
}

function F({ name, label, type = 'text', required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-[#8497a1] mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white"
      />
    </div>
  );
}

function Sel({ name, label, options }: { name: string; label: string; options: Array<{ value: string; label: string }> }) {
  return (
    <div>
      <label className="block text-xs text-[#8497a1] mb-1">{label}</label>
      <select name={name} className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
