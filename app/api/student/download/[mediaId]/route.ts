import { NextRequest, NextResponse } from 'next/server';
import { createAuthClient, createAdminClient } from '@/lib/supabase-server';
import { signedDownloadUrl, r2Configured } from '@/lib/r2';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  const { mediaId } = await params;

  // 1. Auth — require authenticated student session
  const auth = await createAuthClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Giriş yapın' }, { status: 401 });

  // 2. Find student record by email
  const db = createAdminClient();
  const { data: student } = await db
    .from('students')
    .select('id')
    .eq('email', user.email!)
    .single();
  if (!student) return NextResponse.json({ error: 'Öğrenci kaydı bulunamadı' }, { status: 403 });

  // 3. Fetch media — must belong to this student and be downloadable
  const { data: media } = await db
    .from('student_media')
    .select('r2_key, downloadable, student_id')
    .eq('id', mediaId)
    .single();

  if (!media) return NextResponse.json({ error: 'Medya bulunamadı' }, { status: 404 });
  if (media.student_id !== student.id)
    return NextResponse.json({ error: 'Erişim yok' }, { status: 403 });
  if (!media.downloadable)
    return NextResponse.json({ error: 'Bu medya henüz açılmadı' }, { status: 403 });

  // 4. Generate R2 signed URL
  if (!r2Configured()) {
    return NextResponse.json({ error: 'R2 yapılandırılmamış' }, { status: 503 });
  }
  const url = await signedDownloadUrl(media.r2_key as string);
  if (!url) return NextResponse.json({ error: 'URL oluşturulamadı' }, { status: 500 });

  return NextResponse.redirect(url);
}
