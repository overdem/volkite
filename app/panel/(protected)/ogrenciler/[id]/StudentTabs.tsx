'use client';

import { useState, useTransition } from 'react';
import { updateStudent, updateLesson, addPayment, togglePaymentPaid, toggleMediaDownloadable } from '../../../actions';

type Student = Record<string, unknown>;
type Lesson = { id: string; lesson_no: number; title: string | null; status: string; hours: number | null; wind_kn: number | null; instructor_notes: string | null };
type Payment = { id: string; amount_eur: number | null; type: string | null; method: string | null; paid: boolean; notes: string | null };
type Accom = Record<string, unknown>;
type Equip = Record<string, unknown>;
type Media = { id: string; type: string | null; r2_key: string; thumb_key: string | null; preview_key: string | null; downloadable: boolean; created_at: string };

interface Props {
  studentId: string;
  data: { student: Student; lessons: Lesson[]; payments: Payment[]; accommodation: Accom[]; equipment: Equip[]; media: Media[] };
}

const TABS = ['Profil', 'Dersler', 'Ödemeler', 'Konaklama', 'Ekipman', 'Medya'];

export default function StudentTabs({ studentId, data }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === i ? 'bg-[#14b8cf] text-[#062131]' : 'text-[#8497a1] hover:text-[#07283b]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && <ProfileTab student={data.student} studentId={studentId} />}
      {tab === 1 && <LessonsTab lessons={data.lessons} />}
      {tab === 2 && <PaymentsTab payments={data.payments} studentId={studentId} />}
      {tab === 3 && <InfoTab title="Konaklama" items={data.accommodation} />}
      {tab === 4 && <InfoTab title="Ekipman" items={data.equipment} />}
      {tab === 5 && <MediaTab media={data.media} studentId={studentId} />}
    </div>
  );
}

// ─── Profil ──────────────────────────────────────────────────────────────────

function ProfileTab({ student, studentId }: { student: Student; studentId: string }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((v, k) => { if (v !== '') data[k] = v; });
    startTransition(async () => {
      await updateStudent(studentId, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const fields: [string, string, string][] = [
    ['name', 'Ad Soyad', 'text'],
    ['contact', 'Telefon/WA', 'text'],
    ['email', 'E-posta', 'email'],
    ['nationality', 'Uyruk', 'text'],
    ['weight_kg', 'Kilo (kg)', 'number'],
    ['emergency_contact', 'Acil İletişim', 'text'],
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 max-w-lg space-y-4">
      {fields.map(([name, label, type]) => (
        <div key={name}>
          <label className="block text-xs text-[#8497a1] mb-1">{label}</label>
          <input
            name={name}
            type={type}
            defaultValue={student[name] as string ?? ''}
            className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#14b8cf]"
          />
        </div>
      ))}
      <div>
        <label className="block text-xs text-[#8497a1] mb-1">Seviye</label>
        <select
          name="level"
          defaultValue={student['level'] as string ?? 'beginner'}
          className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#14b8cf]"
        >
          <option value="beginner">Başlangıç</option>
          <option value="intermediate">Orta</option>
          <option value="advanced">İleri</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8497a1] mb-1">Durum</label>
        <select
          name="status"
          defaultValue={student['status'] as string ?? 'active'}
          className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#14b8cf]"
        >
          <option value="prospect">Aday</option>
          <option value="active">Aktif</option>
          <option value="completed">Tamamladı</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-[#8497a1] mb-1">Notlar</label>
        <textarea
          name="notes"
          defaultValue={student['notes'] as string ?? ''}
          rows={3}
          className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#14b8cf] resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2 bg-[#14b8cf] text-[#062131] font-semibold rounded-lg text-sm hover:bg-[#0fa3b8] disabled:opacity-60 transition-colors"
      >
        {saved ? '✓ Kaydedildi' : pending ? 'Kaydediliyor…' : 'Kaydet'}
      </button>
    </form>
  );
}

// ─── Dersler ─────────────────────────────────────────────────────────────────

function LessonsTab({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="space-y-3">
      {lessons.map((l) => (
        <LessonCard key={l.id} lesson={l} />
      ))}
      {lessons.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-[#8497a1] shadow-sm">
          Ders kaydı bulunamadı.
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(lesson.status === 'done');
  const [notes, setNotes] = useState(lesson.instructor_notes ?? '');
  const [hours, setHours] = useState(lesson.hours?.toString() ?? '');
  const [wind, setWind] = useState(lesson.wind_kn?.toString() ?? '');
  const [saved, setSaved] = useState(false);

  function save() {
    startTransition(async () => {
      await updateLesson(lesson.id, {
        status: done ? 'done' : 'pending',
        instructor_notes: notes,
        hours: hours ? parseFloat(hours) : null,
        wind_kn: wind ? parseFloat(wind) : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-5 border-l-4 ${done ? 'border-[#14b8cf]' : 'border-[#e4e9ee]'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-[#eef1f4] text-[#8497a1] text-xs font-bold flex items-center justify-center">
            {lesson.lesson_no}
          </span>
          <span className="font-medium text-[#07283b] text-sm">{lesson.title}</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(e.target.checked)}
            className="accent-[#14b8cf] w-4 h-4"
          />
          <span className="text-xs text-[#8497a1]">Tamamlandı</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Süre (saat)</label>
          <input
            type="number"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full border border-[#e4e9ee] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#14b8cf]"
          />
        </div>
        <div>
          <label className="block text-xs text-[#8497a1] mb-1">Rüzgâr (kn)</label>
          <input
            type="number"
            step="0.5"
            value={wind}
            onChange={(e) => setWind(e.target.value)}
            className="w-full border border-[#e4e9ee] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#14b8cf]"
          />
        </div>
      </div>

      <textarea
        placeholder="Hoca notu…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full border border-[#e4e9ee] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#14b8cf] resize-none mb-3"
      />

      <button
        onClick={save}
        disabled={pending}
        className="px-4 py-1.5 text-xs font-semibold bg-[#eef1f4] text-[#07283b] rounded-lg hover:bg-[#e4e9ee] disabled:opacity-60 transition-colors"
      >
        {saved ? '✓ Kaydedildi' : pending ? '…' : 'Kaydet'}
      </button>
    </div>
  );
}

// ─── Ödemeler ────────────────────────────────────────────────────────────────

function PaymentsTab({ payments, studentId }: { payments: Payment[]; studentId: string }) {
  const [pending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fd.forEach((v, k) => { data[k] = v; });
    startTransition(async () => {
      await addPayment(studentId, data);
      setShowForm(false);
    });
  }

  const total = payments.reduce((s, p) => s + (p.amount_eur ?? 0), 0);
  const paid = payments.filter((p) => p.paid).reduce((s, p) => s + (p.amount_eur ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-[#8497a1] mb-1">Toplam</p>
          <p className="text-2xl font-bold text-[#07283b]">{total}€</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-[#8497a1] mb-1">Ödendi</p>
          <p className="text-2xl font-bold text-[#3ee07a]">{paid}€</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e4e9ee]">
          <h3 className="font-semibold text-[#07283b] text-sm">Ödeme Listesi</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-[#14b8cf] font-medium hover:underline"
          >
            + Ekle
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAdd} className="p-5 border-b border-[#e4e9ee] bg-[#f9fafb] grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#8497a1] mb-1">Tür</label>
              <select name="type" className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="package">Paket</option>
                <option value="hourly">Saatlik</option>
                <option value="accommodation">Konaklama</option>
                <option value="rental">Kiralama</option>
                <option value="storage">Depolama</option>
                <option value="media">Medya</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8497a1] mb-1">Tutar (€)</label>
              <input name="amount_eur" type="number" step="0.01" required className="w-full border border-[#e4e9ee] rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={pending} className="px-4 py-2 bg-[#14b8cf] text-[#062131] font-semibold rounded-lg text-sm disabled:opacity-60">
                Ekle
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-[#8497a1] text-sm">İptal</button>
            </div>
          </form>
        )}

        <ul className="divide-y divide-[#e4e9ee]">
          {payments.map((p) => (
            <PaymentRow key={p.id} payment={p} studentId={studentId} />
          ))}
          {payments.length === 0 && (
            <li className="px-5 py-8 text-center text-[#8497a1] text-sm">Ödeme kaydı yok.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function PaymentRow({ payment, studentId }: { payment: Payment; studentId: string }) {
  const [pending, startTransition] = useTransition();

  function togglePaid() {
    startTransition(async () => {
      await togglePaymentPaid(payment.id, !payment.paid, studentId);
    });
  }

  return (
    <li className="flex items-center justify-between px-5 py-3">
      <div>
        <span className="text-sm font-medium text-[#07283b] capitalize">{payment.type ?? '—'}</span>
        {payment.notes && <span className="text-xs text-[#8497a1] ml-2">{payment.notes}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-[#07283b]">{payment.amount_eur}€</span>
        <button
          onClick={togglePaid}
          disabled={pending}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            payment.paid
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {payment.paid ? 'Ödendi ✓' : 'Bekliyor'}
        </button>
      </div>
    </li>
  );
}

// ─── Medya ───────────────────────────────────────────────────────────────────

function MediaTab({ media, studentId }: { media: Media[]; studentId: string }) {
  if (media.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-[#8497a1]">
        Bu öğrenciye henüz medya atanmamış.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {media.map((m) => (
        <MediaCard key={m.id} media={m} studentId={studentId} />
      ))}
    </div>
  );
}

function MediaCard({ media, studentId }: { media: Media; studentId: string }) {
  const [pending, startTransition] = useTransition();
  const [downloadable, setDownloadable] = useState(media.downloadable);

  function toggle() {
    startTransition(async () => {
      await toggleMediaDownloadable(media.id, !downloadable, studentId);
      setDownloadable(!downloadable);
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="aspect-square bg-[#eef1f4] flex items-center justify-center text-4xl">
        {media.type === 'video' ? '🎬' : '📷'}
      </div>
      <div className="p-3">
        <p className="text-xs text-[#8497a1] mb-2 truncate">{media.r2_key}</p>
        <button
          onClick={toggle}
          disabled={pending}
          className={`w-full text-xs font-semibold py-1.5 rounded-lg transition-colors ${
            downloadable
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-[#eef1f4] text-[#8497a1] hover:bg-[#e4e9ee]'
          }`}
        >
          {downloadable ? '🔓 İndirilebilir' : '🔒 Kilitli — Aç'}
        </button>
      </div>
    </div>
  );
}

// ─── Generic Info Tab ─────────────────────────────────────────────────────────

function InfoTab({ title, items }: { title: string; items: Record<string, unknown>[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="font-semibold text-[#07283b] mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-[#8497a1] text-sm">Kayıt bulunamadı.</p>
      ) : (
        <pre className="text-xs text-[#3a5563] bg-[#eef1f4] p-4 rounded-xl overflow-auto">
          {JSON.stringify(items, null, 2)}
        </pre>
      )}
    </div>
  );
}
