'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type Student = { id: string; name: string };

export default function MediaUploader({ students }: { students: Student[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setDone(false);
    setProgress(0);
    if (!studentId) {
      setError('Öğrenci seçin');
      return;
    }
    if (!file) {
      setError('Dosya seçin');
      return;
    }
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append('studentId', studentId);
        fd.append('type', type);
        fd.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };

        const result: { ok?: boolean; error?: string } = await new Promise((resolve) => {
          xhr.onload = () => {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              resolve({ error: `Sunucu yanıtı geçersiz (${xhr.status})` });
            }
          };
          xhr.onerror = () => resolve({ error: 'Ağ hatası' });
          xhr.open('POST', '/api/admin/upload');
          xhr.send(fd);
        });

        if (!result.ok) {
          setError(result.error ?? 'Bilinmeyen hata');
          setProgress(0);
          return;
        }

        setDone(true);
        setFile(null);
        setStudentId('');
        setProgress(0);
        // Reset file input
        const fileInput = document.getElementById('media-file-input') as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Hata');
        setProgress(0);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="font-semibold text-[#07283b]">Yeni Medya Yükle</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Öğrenci</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white"
            required
          >
            <option value="">Seç…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {students.length === 0 && (
            <p className="text-xs text-red-600 mt-1">Önce öğrenci eklemelisin.</p>
          )}
        </div>
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Tip</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'photo' | 'video')}
            className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="photo">Foto</option>
            <option value="video">Video</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Dosya</label>
          <input
            id="media-file-input"
            type="file"
            accept={type === 'photo' ? 'image/*' : 'video/*'}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
            required
          />
        </div>
      </div>
      {pending && progress > 0 && (
        <div className="w-full bg-[#eef1f4] rounded-full h-1.5">
          <div className="bg-[#14b8cf] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {done && <p className="text-sm text-green-700">✓ Yüklendi ve öğrenciye atandı</p>}
      <button
        type="submit"
        disabled={pending || students.length === 0}
        className="bg-[#14b8cf] text-[#062131] font-bold px-5 py-2 rounded-lg text-sm hover:bg-[#0fa3b8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? `Yükleniyor… ${progress}%` : 'Yükle ve Ata'}
      </button>
      <p className="text-xs text-[#8497a1]">
        Maks. dosya boyutu: ~50 MB. Daha büyük videolar için Cloudflare R2 CORS ile doğrudan yükleme gerekli (ileride).
      </p>
    </form>
  );
}
