import { NextResponse, type NextRequest } from 'next/server';
import { createAuthClient, createAdminClient } from '@/lib/supabase-server';
import { signedDownloadUrl } from '@/lib/r2';

// Öğrencinin atanmış medyasının filigranlı önizlemesi için kısa ömürlü URL döner.
// Sahiplik kontrolü: yalnız kendi medyasını görebilir.
export async function GET(_req: NextRequest, ctx: { params: Promise<{ mediaId: string }> }) {
  const { mediaId } = await ctx.params;

  const auth = await createAuthClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const db = createAdminClient();
  const { data: student } = await db
    .from('students')
    .select('id')
    .eq('email', user.email)
    .maybeSingle();
  if (!student) {
    return NextResponse.json({ error: 'Öğrenci kaydı yok' }, { status: 403 });
  }

  const { data: media } = await db
    .from('student_media')
    .select('preview_key, student_id')
    .eq('id', mediaId)
    .maybeSingle();
  if (!media || String(media.student_id) !== String(student.id)) {
    return NextResponse.json({ error: 'Erişim yok' }, { status: 403 });
  }
  if (!media.preview_key) {
    return NextResponse.json({ error: 'Önizleme yok' }, { status: 404 });
  }

  const url = await signedDownloadUrl(media.preview_key as string);
  if (!url) {
    return NextResponse.json({ error: 'R2 yapılandırılmamış' }, { status: 500 });
  }

  return NextResponse.redirect(url);
}
