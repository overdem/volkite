import { NextResponse, type NextRequest } from 'next/server';
import { getUserRole, createAdminClient } from '@/lib/supabase-server';
import { uploadObject, buildMediaKey, r2Configured } from '@/lib/r2';

// Vercel function body limiti yükselt (büyük foto/video için)
export const maxDuration = 60;

// multipart/form-data: file, studentId, type
// → 200 { ok: true, mediaId, key }
// Server üzerinden R2'ye yükler (CORS gerekmez).
export async function POST(req: NextRequest) {
  const { role, userId } = await getUserRole();
  if (role !== 'admin' || !userId) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
  }
  if (!r2Configured()) {
    return NextResponse.json(
      { error: 'R2 yapılandırılmamış. R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET env vars eksik.' },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'multipart/form-data bekleniyor' }, { status: 400 });
  }

  const file = form.get('file');
  const studentId = String(form.get('studentId') ?? '');
  const type = String(form.get('type') ?? 'photo') === 'video' ? 'video' : 'photo';

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 });
  }
  if (!studentId) {
    return NextResponse.json({ error: 'studentId gerekli' }, { status: 400 });
  }

  const key = buildMediaKey(studentId, file.name);
  const ab = await file.arrayBuffer();
  const ct = file.type || 'application/octet-stream';

  const ok = await uploadObject(key, ab, ct);
  if (!ok) {
    return NextResponse.json({ error: 'R2 yüklemesi başarısız oldu (sunucu logunu kontrol et)' }, { status: 500 });
  }

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

  return NextResponse.json({ ok: true, mediaId: media.id, key });
}
