import { NextResponse, type NextRequest } from 'next/server';
import { getUserRole, createAdminClient } from '@/lib/supabase-server';
import { signedUploadUrl, buildMediaKey, r2Configured, getObjectBuffer, uploadObject } from '@/lib/r2';
import { generateWatermarkedPreview, previewKeyFor } from '@/lib/watermark';

// İki aşamalı: önce presign al → tarayıcıdan doğrudan R2'ye PUT (CORS gerekli, Vercel body limiti yok).
//
// 1) POST /api/admin/upload?step=presign  body: { studentId, filename, contentType, type }
//    → 200 { uploadUrl, key }
// 2) POST /api/admin/upload?step=commit   body: { studentId, key, type }
//    → 200 { ok, mediaId }
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

  const step = req.nextUrl.searchParams.get('step') ?? 'presign';
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Geçersiz JSON' }, { status: 400 });
  }

  if (step === 'presign') {
    const studentId = String(body.studentId ?? '');
    const filename = String(body.filename ?? '');
    const contentType = String(body.contentType ?? 'application/octet-stream');
    if (!studentId || !filename) {
      return NextResponse.json({ error: 'studentId ve filename gerekli' }, { status: 400 });
    }
    const key = buildMediaKey(studentId, filename);
    const uploadUrl = await signedUploadUrl(key, contentType);
    if (!uploadUrl) {
      return NextResponse.json({ error: 'Presigned URL üretilemedi' }, { status: 500 });
    }
    return NextResponse.json({ uploadUrl, key });
  }

  if (step === 'commit') {
    const studentId = String(body.studentId ?? '');
    const key = String(body.key ?? '');
    const type = body.type === 'video' ? 'video' : 'photo';
    if (!studentId || !key) {
      return NextResponse.json({ error: 'studentId ve key gerekli' }, { status: 400 });
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

    // Foto için filigranlı önizleme üret (video için MVP'de atla)
    let watermarkStatus: 'ok' | 'skipped' | 'error' = 'skipped';
    if (type === 'photo') {
      try {
        const original = await getObjectBuffer(key);
        if (original) {
          const preview = await generateWatermarkedPreview(original);
          const previewKey = previewKeyFor(key);
          const ok = await uploadObject(previewKey, preview, 'image/jpeg');
          if (ok) {
            await db.from('student_media').update({ preview_key: previewKey }).eq('id', media.id);
            watermarkStatus = 'ok';
          } else {
            watermarkStatus = 'error';
          }
        }
      } catch (err) {
        console.error('Watermark pipeline failed:', err);
        watermarkStatus = 'error';
      }
    }

    return NextResponse.json({ ok: true, mediaId: media.id, watermark: watermarkStatus });
  }

  return NextResponse.json({ error: 'Bilinmeyen step' }, { status: 400 });
}
