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
    if (!studentId) { setError('Öğrenci seçin'); return; }
    if (!file) { setError('Dosya seçin'); return; }

    startTransition(async () => {
      try {
        // 1) Presign
        const presignRes = await fetch('/api/admin/upload?step=presign', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            studentId,
            filename: file.name,
            contentType: file.type || 'application/octet-stream',
          }),
        });
        const presign: { uploadUrl?: string; key?: string; error?: string } = await presignRes
          .json()
          .catch(() => ({ error: `Presign yanıtı bozuk (${presignRes.status})` }));
        if (!presignRes.ok || !presign.uploadUrl || !presign.key) {
          setError(presign.error ?? `Presign başarısız (${presignRes.status})`);
          return;
        }

        // 2) Doğrudan R2'ye PUT — R2 CORS açık olmalı
        const putOk: { ok: boolean; status: number; statusText: string } = await new Promise((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
          };
          xhr.onload = () => resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, statusText: xhr.statusText });
          xhr.onerror = () => resolve({ ok: false, status: 0, statusText: 'CORS ya da ağ hatası' });
          xhr.open('PUT', presign.uploadUrl!);
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
          xhr.send(file);
        });

        if (!putOk.ok) {
          if (putOk.status === 0) {
            setError(
              'R2 CORS engeli. Cloudflare R2 dashboard → bucket → Settings → CORS Policy ekle. ' +
              '(Tarayıcı konsolu detay verir.)'
            );
          } else {
            setError(`R2 yüklemesi başarısız: ${putOk.status} ${putOk.statusText}`);
          }
          setProgress(0);
          return;
        }

        // 3) Commit (DB kaydı)
        const commitRes = await fetch('/api/admin/upload?step=commit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ studentId, key: presign.key, type }),
        });
        const commit: { ok?: boolean; error?: string } = await commitRes
          .json()
          .catch(() => ({ error: `Commit yanıtı bozuk (${commitRes.status})` }));
        if (!commitRes.ok || !commit.ok) {
          setError(commit.error ?? `Commit başarısız (${commitRes.status})`);
          return;
        }

        setDone(true);
        setFile(null);
        setStudentId('');
        setProgress(0);
        const fi = document.getElementById('media-file-input') as HTMLInputElement | null;
        if (fi) fi.value = '';
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Beklenmeyen hata');
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
          <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
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
    </form>
  );
}
