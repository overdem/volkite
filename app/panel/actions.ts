'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAuthClient, createAdminClient } from '@/lib/supabase-server';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) return { error: error.message };
  redirect('/panel');
}

export async function logout() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect('/panel/login');
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

const LESSON_TITLES = [
  'Teori & Uçurtma Kontrolü',
  'Body Drag & Su Güvenliği',
  'Twintip Sürüş Temelleri',
  'Yön Değiştirme & Kontrol',
  'Bağımsız Sürüş',
];

export async function approveBooking(bookingId: string) {
  const db = createAdminClient();

  const { data: booking } = await db
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (!booking) return { error: 'Ön kayıt bulunamadı' };

  // Create student
  const { data: student, error: sErr } = await db
    .from('students')
    .insert({
      name: booking.name,
      contact: booking.contact,
      language: booking.language,
      level: booking.level,
      status: 'active',
    })
    .select('id')
    .single();

  if (sErr) return { error: sErr.message };

  // Create 5 lesson_progress entries
  const lessons = LESSON_TITLES.map((title, i) => ({
    student_id: student.id,
    lesson_no: i + 1,
    title,
    status: 'pending',
  }));
  await db.from('lesson_progress').insert(lessons);

  // Update booking
  await db
    .from('bookings')
    .update({ status: 'confirmed', student_id: student.id })
    .eq('id', bookingId);

  revalidatePath('/panel/on-kayitlar');
  revalidatePath('/panel/ogrenciler');
  revalidatePath('/panel');
  return { ok: true, studentId: student.id };
}

export async function rejectBooking(bookingId: string, reason?: string) {
  const db = createAdminClient();
  await db
    .from('bookings')
    .update({ status: 'cancelled', notes: reason ?? null })
    .eq('id', bookingId);
  revalidatePath('/panel/on-kayitlar');
  revalidatePath('/panel');
  return { ok: true };
}

// ─── Students ─────────────────────────────────────────────────────────────────

export async function updateStudent(id: string, data: Record<string, unknown>) {
  const db = createAdminClient();
  const { error } = await db.from('students').update(data).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/panel/ogrenciler/${id}`);
  revalidatePath('/panel/ogrenciler');
  return { ok: true };
}

export async function updateLesson(id: string, data: Record<string, unknown>) {
  const db = createAdminClient();
  const payload = { ...data };
  if (payload['status'] === 'done' && !payload['completed_at']) {
    payload['completed_at'] = new Date().toISOString();
  }
  const { error } = await db.from('lesson_progress').update(payload).eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/panel/ogrenciler');
  return { ok: true };
}

export async function addPayment(studentId: string, data: Record<string, unknown>) {
  const db = createAdminClient();
  const { error } = await db.from('payments').insert({ student_id: studentId, ...data });
  if (error) return { error: error.message };
  revalidatePath(`/panel/ogrenciler/${studentId}`);
  return { ok: true };
}

export async function togglePaymentPaid(paymentId: string, paid: boolean, studentId: string) {
  const db = createAdminClient();
  await db
    .from('payments')
    .update({ paid, paid_at: paid ? new Date().toISOString() : null })
    .eq('id', paymentId);
  revalidatePath(`/panel/ogrenciler/${studentId}`);
  return { ok: true };
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function updateSiteSettings(data: Record<string, unknown>) {
  const db = createAdminClient();
  const { error } = await db.from('site_settings').update(data).eq('id', 1);
  if (error) return { error: error.message };
  revalidatePath('/panel/ayarlar');
  return { ok: true };
}

export async function updateWindBand(level: string, data: Record<string, unknown>) {
  const db = createAdminClient();
  const { error } = await db.from('wind_bands').update(data).eq('level', level);
  if (error) return { error: error.message };
  revalidatePath('/panel/ayarlar');
  return { ok: true };
}
