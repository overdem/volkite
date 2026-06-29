import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient } from '@/lib/supabase-server';

// Supabase magic link → code exchange → session cookie
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/ogrenci';

  if (code) {
    const supabase = await createAuthClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/ogrenci/login?error=auth`);
}
