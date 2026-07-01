'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createAuthClient, createAdminClient, getUserRole } from '@/lib/supabase-server';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });
  if (error) return { error: error.message };

  // Rol bazlı yönlendirme
  const { role, active } = await getUserRole();
  if (!active || !role) {
    await supabase.auth.signOut();
    return { error: 'Hesabınız aktif değil veya yetki bulunamadı.' };
  }
  if (role === 'student') {
    await supabase.auth.signOut();
    return { error: 'Öğrenciler /ogrenci adresinden giriş yapmalıdır.' };
  }
  // admin ve instructor (hoca) panele girer
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

// ─── Media ────────────────────────────────────────────────────────────────────

export async function toggleMediaDownloadable(
  mediaId: string,
  downloadable: boolean,
  studentId: string
) {
  const { role } = await getUserRole();
  if (role !== 'admin') return { error: 'Yetkisiz' };
  const db = createAdminClient();
  await db.from('student_media').update({ downloadable }).eq('id', mediaId);
  revalidatePath(`/panel/ogrenciler/${studentId}`);
  revalidatePath('/panel/medya');
  return { ok: true };
}

export async function setMediaDownloadable(mediaId: string, downloadable: boolean) {
  const { role } = await getUserRole();
  if (role !== 'admin') return { error: 'Yetkisiz' };
  const db = createAdminClient();
  await db.from('student_media').update({ downloadable }).eq('id', mediaId);
  revalidatePath('/panel/medya');
  return { ok: true };
}

export async function deleteMedia(mediaId: string) {
  const { role } = await getUserRole();
  if (role !== 'admin') return { error: 'Yetkisiz' };
  const db = createAdminClient();
  const { data: m } = await db.from('student_media').select('r2_key').eq('id', mediaId).maybeSingle();
  await db.from('student_media').delete().eq('id', mediaId);
  if (m?.r2_key) {
    const { deleteObject } = await import('@/lib/r2');
    await deleteObject(m.r2_key as string);
  }
  revalidatePath('/panel/medya');
  return { ok: true };
}

// ─── Instructors (admin only) ────────────────────────────────────────────────

export async function createInstructor(formData: FormData) {
  const { role } = await getUserRole();
  if (role !== 'admin') return { error: 'Yetkisiz' };

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const name = String(formData.get('name') ?? '').trim();
  if (!email || !password || !name) return { error: 'Tüm alanlar zorunlu' };
  if (password.length < 8) return { error: 'Şifre en az 8 karakter olmalı' };

  const db = createAdminClient();
  const { data: created, error: authErr } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr || !created?.user) return { error: authErr?.message ?? 'Auth oluşturulamadı' };

  const { error: profErr } = await db
    .from('profiles')
    .insert({ id: created.user.id, name, role: 'instructor', active: true });
  if (profErr) {
    // rollback auth
    await db.auth.admin.deleteUser(created.user.id);
    return { error: profErr.message };
  }
  revalidatePath('/panel/hocalar');
  return { ok: true };
}

export async function toggleInstructorActive(profileId: string, active: boolean) {
  const { role } = await getUserRole();
  if (role !== 'admin') return { error: 'Yetkisiz' };
  const db = createAdminClient();
  await db.from('profiles').update({ active }).eq('id', profileId);
  revalidatePath('/panel/hocalar');
  return { ok: true };
}

export async function deleteInstructor(profileId: string) {
  const { role } = await getUserRole();
  if (role !== 'admin') return { error: 'Yetkisiz' };
  const db = createAdminClient();
  // Önce öğrencilerin atamasını boşalt
  await db.from('students').update({ assigned_instructor: null }).eq('assigned_instructor', profileId);
  await db.from('profiles').delete().eq('id', profileId);
  await db.auth.admin.deleteUser(profileId);
  revalidatePath('/panel/hocalar');
  return { ok: true };
}

// ─── Sessions (planlanmış dersler) ───────────────────────────────────────────

export async function createSession(input: {
  studentId: string;
  scheduledAt: string;       // ISO timestamp
  durationHours?: number;
  instructorId?: string;     // admin override
  note?: string;
}) {
  const { role, userId } = await getUserRole();
  if (!userId || (role !== 'admin' && role !== 'instructor')) return { error: 'Yetkisiz' };

  const instructor_id = role === 'admin' ? (input.instructorId ?? userId) : userId;

  const db = createAdminClient();
  const { data, error } = await db
    .from('sessions')
    .insert({
      student_id: input.studentId,
      instructor_id,
      scheduled_at: input.scheduledAt,
      duration_hours: input.durationHours ?? 1.5,
      status: 'planned',
      note: input.note ?? null,
      created_by: userId,
    })
    .select('id')
    .single();
  if (error) return { error: error.message };

  revalidatePath('/panel/takvim');
  revalidatePath('/panel');
  revalidatePath(`/panel/ogrenciler/${input.studentId}`);
  return { ok: true, sessionId: data.id };
}

export async function completeSession(input: {
  sessionId: string;
  lessonProgressId?: string;   // hangi müfredat dersi tamamlandı
  windKn?: number;
  note?: string;
}) {
  const { role, userId } = await getUserRole();
  if (!userId || (role !== 'admin' && role !== 'instructor')) return { error: 'Yetkisiz' };

  const db = createAdminClient();

  // Session güncelle
  const now = new Date().toISOString();
  const { data: sess, error: sErr } = await db
    .from('sessions')
    .update({
      status: 'done',
      completed_at: now,
      wind_kn: input.windKn ?? null,
      note: input.note ?? null,
      lesson_progress_id: input.lessonProgressId ?? null,
    })
    .eq('id', input.sessionId)
    .select('student_id, instructor_id')
    .single();
  if (sErr) return { error: sErr.message };

  // Hoca kendi olmayanı tamamlayamaz (RLS ek olarak server-side kontrol)
  if (role === 'instructor' && sess.instructor_id !== userId) {
    return { error: 'Yalnız kendi session\'ınızı tamamlayabilirsiniz' };
  }

  // İlgili müfredat dersini de "done" yap
  if (input.lessonProgressId) {
    await db
      .from('lesson_progress')
      .update({
        status: 'done',
        completed_at: now,
        wind_kn: input.windKn ?? null,
        instructor_id: userId,
        instructor_notes: input.note ?? null,
      })
      .eq('id', input.lessonProgressId);
  }

  revalidatePath('/panel/takvim');
  revalidatePath('/panel');
  revalidatePath(`/panel/ogrenciler/${sess.student_id}`);
  revalidatePath('/ogrenci');
  return { ok: true };
}

export async function cancelSession(sessionId: string) {
  const { role, userId } = await getUserRole();
  if (!userId || (role !== 'admin' && role !== 'instructor')) return { error: 'Yetkisiz' };

  const db = createAdminClient();
  const { data: sess } = await db.from('sessions').select('instructor_id, student_id').eq('id', sessionId).single();
  if (!sess) return { error: 'Session bulunamadı' };
  if (role === 'instructor' && sess.instructor_id !== userId) {
    return { error: 'Yalnız kendi session\'ınızı iptal edebilirsiniz' };
  }

  await db.from('sessions').update({ status: 'cancelled' }).eq('id', sessionId);
  revalidatePath('/panel/takvim');
  revalidatePath(`/panel/ogrenciler/${sess.student_id}`);
  return { ok: true };
}

// ─── Hoca: kendi öğrencisini ekle ─────────────────────────────────────────────

export async function createStudentForInstructor(formData: FormData) {
  const { role, userId } = await getUserRole();
  if (!userId || (role !== 'admin' && role !== 'instructor')) return { error: 'Yetkisiz' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { error: 'Ad gerekli' };

  const contact = String(formData.get('contact') ?? '').trim() || null;
  const email = String(formData.get('email') ?? '').trim() || null;
  const level = String(formData.get('level') ?? '').trim() || null;
  const language = String(formData.get('language') ?? '').trim() || null;
  const gender = String(formData.get('gender') ?? '').trim() || null;
  const birth_date = String(formData.get('birth_date') ?? '').trim() || null;
  const weightRaw = String(formData.get('weight_kg') ?? '').trim();
  const weight_kg = weightRaw ? Number(weightRaw) : null;
  // Hoca kendine atar; admin manuel seçebilir ama bu form her ikisi için de basit
  const assigned = String(formData.get('assigned_instructor') ?? '').trim() || (role === 'instructor' ? userId : null);

  const db = createAdminClient();
  const payload: Record<string, unknown> = {
    name,
    contact,
    email,
    level,
    language,
    weight_kg,
    assigned_instructor: assigned,
    status: 'active',
  };
  // Yeni kolonlar (migration 010) — yalnız doluysa gönder ki migration
  // uygulanmadan da öğrenci oluşturma çalışsın.
  if (gender) payload.gender = gender;
  if (birth_date) payload.birth_date = birth_date;

  const { data: student, error } = await db
    .from('students')
    .insert(payload)
    .select('id')
    .single();
  if (error) return { error: error.message };

  // 5 ders oluştur
  const lessons = LESSON_TITLES.map((title, i) => ({
    student_id: student.id,
    lesson_no: i + 1,
    title,
    status: 'pending',
  }));
  await db.from('lesson_progress').insert(lessons);

  revalidatePath('/panel/ogrenciler');
  revalidatePath('/panel');
  return { ok: true, studentId: student.id };
}
