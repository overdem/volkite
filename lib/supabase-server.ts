import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Auth client — anon key + SSR cookies — for session management
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Component render'ında çağrılırsa Next "cookies can only be
          // modified in a Server Action/Route Handler" hatası atar → yut.
          // Oturum yenileme zaten getUser() ile bu istekte geçerli; kalıcı
          // yazma bir sonraki Server Action/Route Handler'da olur.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            /* Server Component'ten çağrıldı — güvenle yok sayılır */
          }
        },
      },
    }
  );
}

// Admin client — service_role key — bypasses RLS, for panel data ops
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type UserRole = 'admin' | 'instructor' | 'student' | null;

// Giriş yapan kullanıcının rolünü döner. Personel ise profiles.role; değilse student.
export async function getUserRole(): Promise<{ userId: string | null; email: string | null; role: UserRole; active: boolean }> {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, email: null, role: null, active: false };

  // profiles üzerinden personel mi?
  const db = createAdminClient();
  const { data: profile } = await db
    .from('profiles')
    .select('role, active')
    .eq('id', user.id)
    .maybeSingle();

  if (profile) {
    return {
      userId: user.id,
      email: user.email ?? null,
      role: (profile.role as 'admin' | 'instructor'),
      active: profile.active !== false,
    };
  }

  // profiles satırı yok → öğrenci olabilir (email students tablosunda mı?)
  if (user.email) {
    const { data: student } = await db
      .from('students')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    if (student) {
      return { userId: user.id, email: user.email, role: 'student', active: true };
    }
  }

  return { userId: user.id, email: user.email ?? null, role: null, active: false };
}
