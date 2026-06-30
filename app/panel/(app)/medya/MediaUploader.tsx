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
    if (!studentId || !file) {
      setError('Öğrenci ve dosya seçin');
      return;
    }
    startTransition(async () => {
      try {
        // 1. Presigned URL al
        const presignRes = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            studentId,
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
            type,
          }),
        });
        const presign = await presignRes.json();
        if (!presignRes.ok) {
          setError(presign.error ?? 'Yükleme URL alınamadı');
          return;
        }

        // 2. R2'ye PUT
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        await new Promise<void>((resolve, reject) => {
          xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('PUT failed: ' + xhr.status)));
          xhr.onerror = () => reject(new Error('PUT network error'));
          xhr.open('PUT', presign.uploadUrl);
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
          xhr.send(file);
        });

        setDone(true);
        setFile(null);
        setProgress(0);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Hata');
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
          <div className="bg-[#14b8cf] h-1.5 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-700">Yüklendi ✓</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-[#14b8cf] text-[#062131] font-bold px-5 py-2 rounded-lg text-sm hover:bg-[#0fa3b8] transition-colors disabled:opacity-60"
      >
        {pending ? 'Yükleniyor…' : 'Yükle ve Ata'}
      </button>
    </form>
  );
}
