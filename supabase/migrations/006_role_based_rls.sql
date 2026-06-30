-- Volkite · Panel Modülü — Rol bazlı RLS sıkılaştırma (KVKK kritik)
-- profiles.role: 'admin' | 'instructor' (= hoca)
-- Öğrenci: profiles satırı YOK, sadece students.email = auth.email()

-- ─── Helper: çağıran admin mi? ──────────────────────────────────────────────
create or replace function is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and active = true
  );
$$;

-- ─── Helper: çağıran personel mi (admin veya hoca)? ─────────────────────────
create or replace function is_staff()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true
  );
$$;

-- ─── Helper: çağıran hoca mı? ───────────────────────────────────────────────
create or replace function is_instructor()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'instructor' and active = true
  );
$$;

-- ─── profiles: kendi profilini herkes okur; admin tümünü okur/yazar ─────────
drop policy if exists "own profile" on profiles;
drop policy if exists "admin see all" on profiles;
drop policy if exists "admin write all" on profiles;

create policy "profiles: self read" on profiles
  for select using (auth.uid() = id);
create policy "profiles: admin read all" on profiles
  for select using (is_admin());
create policy "profiles: admin write all" on profiles
  for all using (is_admin()) with check (is_admin());

-- ─── students: personel yazar/okur; öğrenci sadece kendi satırı ─────────────
drop policy if exists "staff read students" on students;
drop policy if exists "staff write students" on students;
drop policy if exists "student view own" on students;

create policy "students: staff read" on students
  for select using (is_staff());
create policy "students: staff write" on students
  for all using (is_staff()) with check (is_staff());
create policy "students: self read" on students
  for select using (email = auth.email());

-- ─── lesson_progress: personel yazar/okur; öğrenci kendi salt okur ──────────
drop policy if exists "staff read lessons" on lesson_progress;
drop policy if exists "staff write lessons" on lesson_progress;
drop policy if exists "student view own lessons" on lesson_progress;

create policy "lessons: staff read" on lesson_progress
  for select using (is_staff());
create policy "lessons: staff write" on lesson_progress
  for all using (is_staff()) with check (is_staff());
create policy "lessons: student self read" on lesson_progress
  for select using (student_id = current_student_id());

-- ─── payments: personel yazar/okur; öğrenci kendi salt okur ────────────────
drop policy if exists "staff read payments" on payments;
drop policy if exists "staff write payments" on payments;

create policy "payments: staff read" on payments
  for select using (is_staff());
create policy "payments: staff write" on payments
  for all using (is_staff()) with check (is_staff());
create policy "payments: student self read" on payments
  for select using (student_id = current_student_id());

-- ─── accommodation: personel okur/yazar ────────────────────────────────────
drop policy if exists "staff read accom" on accommodation;
drop policy if exists "staff write accom" on accommodation;

create policy "accom: staff read" on accommodation
  for select using (is_staff());
create policy "accom: staff write" on accommodation
  for all using (is_staff()) with check (is_staff());

-- ─── equipment: personel okur/yazar ────────────────────────────────────────
drop policy if exists "staff read equip" on equipment;
drop policy if exists "staff write equip" on equipment;

create policy "equip: staff read" on equipment
  for select using (is_staff());
create policy "equip: staff write" on equipment
  for all using (is_staff()) with check (is_staff());

-- ─── bookings: personel yönetir (provisional → confirmed/cancelled) ────────
drop policy if exists "anon insert booking" on bookings;
drop policy if exists "staff read bookings" on bookings;
drop policy if exists "staff write bookings" on bookings;

-- Public form ön kayıt oluşturabilsin (provisional)
create policy "bookings: anon provisional insert" on bookings
  for insert with check (status = 'provisional');
create policy "bookings: staff read" on bookings
  for select using (is_staff());
create policy "bookings: staff write" on bookings
  for all using (is_staff()) with check (is_staff());

-- ─── student_media: SIKI. Admin yönetir; hoca okuyamaz; öğrenci sadece kendisi ─
drop policy if exists "staff read media" on student_media;
drop policy if exists "staff write media" on student_media;
drop policy if exists "student view own media" on student_media;

-- Admin: tüm medyayı görür ve yönetir
create policy "media: admin read all" on student_media
  for select using (is_admin());
create policy "media: admin write all" on student_media
  for all using (is_admin()) with check (is_admin());
-- Öğrenci: yalnız kendi atanmış medyasını görür (downloadable kontrolü API'de)
create policy "media: student self read" on student_media
  for select using (student_id = current_student_id());
-- Hoca: medyaya HİÇ erişemez (policy yok = deny)

-- ─── site_settings / packages / services / faq: herkes okur, admin yazar ───
-- (Bu tablolar zaten public read için ayarlanmış; admin write garantisi ekle)
drop policy if exists "admin write settings" on site_settings;
create policy "site_settings: admin write" on site_settings
  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write packages" on packages;
create policy "packages: admin write" on packages
  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write services" on services;
create policy "services: admin write" on services
  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write faq" on faq;
create policy "faq: admin write" on faq
  for all using (is_admin()) with check (is_admin());

drop policy if exists "admin write wind_bands" on wind_bands;
create policy "wind_bands: admin write" on wind_bands
  for all using (is_admin()) with check (is_admin());
