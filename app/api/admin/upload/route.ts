import { NextResponse, type NextRequest } from 'next/server';
import { getUserRole, createAdminClient } from '@/lib/supabase-server';
import { signedUploadUrl, buildMediaKey } from '@/lib/r2';

// POST { studentId, filename, contentType, type: 'photo'|'video' }
// → 200 { uploadUrl, key, mediaId }
// Sadece admin.
export async function POST(req: NextRequest) {
  const { role, userId } = await getUserRole();
  if (role !== 'admin' || !userId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const studentId = String(body.studentId ?? '');
  const filename = String(body.filename ?? '');
  const contentType = String(body.contentType ?? '');
  const type = body.type === 'video' ? 'video' : 'photo';

  if (!studentId || !filename || !contentType) {
    return NextResponse.json({ error: 'Eksik alan' }, { status: 400 });
  }

  const key = buildMediaKey(studentId, filename);
  const uploadUrl = await signedUploadUrl(key, contentType);
  if (!uploadUrl) {
    return NextResponse.json({ error: 'R2 yapılandırılmamış' }, { status: 500 });
  }

  // student_media kaydını şimdi oluştur (downloadable=false)
  const db = createAdminClient();
  const { data: media, error } = await db
    .from('student_media')
    .insert({
      student_id: studentId,
      type,
      r2_key: key,
      assigned_by: userId,
      downloadable: false,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ uploadUrl, key, mediaId: media.id });
}
