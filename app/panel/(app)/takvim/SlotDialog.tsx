'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { createSession } from '../../actions';
import { istanbulToUtc, utcToIstanbulHourKey } from '@/lib/openmeteo';
import { levelShort, levelColor } from '@/lib/level';

type Student = { id: string; name: string; level: string; instructorId: string | null };
type Instructor = { id: string; name: string };
type SessionLite = { instructorId: string | null; scheduledAt: string };

const DURATIONS = [1, 1.5, 2];

export default function SlotDialog({
  onClose, onDone, role, students, instructors, iso, windLabel, bucketColor, sessions, mode,
}: {
  onClose: () => void;
  onDone: () => void;
  role: 'admin' | 'instructor';
  students: Student[];
  instructors: Instructor[];
  iso: string | null;                       // "2026-07-01T09:00" (slot modu)
  windLabel?: string;                        // "18 kn — İdeal"
  bucketColor?: { bg: string; text: string };
  sessions: SessionLite[];
  mode: 'slot' | 'manual';
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [studentId, setStudentId] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [duration, setDuration] = useState(1);
  const [search, setSearch] = useState('');
  const [manualDate, setManualDate] = useState(mode === 'manual' ? today : '');
  const [manualTime, setManualTime] = useState('11:00');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const effectiveIso =
    mode === 'manual' ? (manualDate && manualTime ? `${manualDate}T${manualTime}` : null) : iso;

  // Bu slotta zaten dolu olan hocalar
  const busy = new Set<string>();
  if (effectiveIso) {
    const key = effectiveIso.slice(0, 13); // "YYYY-MM-DDTHH"
    sessions.forEach((s) => {
      if (s.instructorId && utcToIstanbulHourKey(s.scheduledAt) === key) busy.add(s.instructorId);
    });
  }

  function onStudent(id: string) {
    setStudentId(id);
    setError('');
    if (role === 'admin') {
      const st = students.find((s) => s.id === id);
      if (st?.instructorId && !busy.has(st.instructorId)) setInstructorId(st.instructorId);
    }
  }

  const filtered = students.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()));

  const slotDateLabel = iso
    ? new Date(iso).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'long' })
    : '';

  function submit() {
    if (!studentId) { setError('Öğrenci seç'); return; }
    if (!effectiveIso) { setError('Tarih ve saat seç'); return; }
    if (role === 'admin' && instructors.length > 0 && !instructorId) { setError('Hoca seç'); return; }
    setError('');
    startTransition(async () => {
      const res = await createSession({
        studentId,
        scheduledAt: istanbulToUtc(effectiveIso),
        durationHours: duration,
        instructorId: role === 'admin' ? (instructorId || undefined) : undefined,
      });
      if (res?.error) { setError(res.error); return; }
      onDone();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ders planla"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-[#07283b]">Ders Planla</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="text-2xl leading-none text-[#8497a1] hover:text-[#07283b] -mt-1"
          >
            ×
          </button>
        </div>

        {/* Bağlam: slot modunda tarih+rüzgâr, manuel modda tarih/saat seçimi */}
        {mode === 'slot' && iso && (
          <div className={`rounded-lg px-3 py-2 text-sm font-bold ${bucketColor?.bg ?? 'bg-[#eef1f4]'} ${bucketColor?.text ?? 'text-[#07283b]'}`}>
            {slotDateLabel} · {iso.slice(11, 16)}
            {windLabel ? ` · ${windLabel}` : ''}
          </div>
        )}
        {mode === 'manual' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8497a1] mb-1">Tarih</label>
              <input
                type="date"
                value={manualDate}
                min={today}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8497a1] mb-1">Saat</label>
              <input
                type="time"
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
                className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Öğrenci — aranabilir */}
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Öğrenci</label>
          <input
            ref={firstRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ara…"
            className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm mb-1.5"
          />
          <div className="max-h-40 overflow-y-auto border border-[#e4e9ee] rounded-lg divide-y divide-[#eef1f4]">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-xs text-[#8497a1]">Öğrenci yok</div>
            )}
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onStudent(s.id)}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-[#f5f7f9] ${
                  studentId === s.id ? 'bg-[#14b8cf]/10' : ''
                }`}
              >
                <span className={`text-[9px] font-bold px-1 py-0 rounded ${levelColor(s.level)}`}>
                  {levelShort(s.level)}
                </span>
                <span className="text-[#07283b]">{s.name}</span>
                {studentId === s.id && <span className="ml-auto text-[#14b8cf] font-bold">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Hoca */}
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Hoca</label>
          {role === 'admin' ? (
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="">Seç…</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id} disabled={busy.has(i.id)}>
                  {i.name}{busy.has(i.id) ? ' — dolu' : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm text-[#07283b] bg-[#eef1f4]">
              Sen
            </div>
          )}
        </div>

        {/* Süre */}
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Süre</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm bg-white"
          >
            {DURATIONS.map((d) => (
              <option key={d} value={d}>{d} saat</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-bold text-[#3a5563] hover:bg-[#eef1f4]"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="px-5 py-2 rounded-lg text-sm font-bold bg-[#ff6a3d] text-white hover:bg-[#ff7f57] disabled:opacity-60"
          >
            {pending ? '...' : 'Ata'}
          </button>
        </div>
      </div>
    </div>
  );
}
