import { describe, it, expect } from 'vitest';

// ─── İndirme erişim kontrol mantığı ──────────────────────────────────────────

function checkDownloadAccess(params: {
  mediaStudentId: string | null;
  currentStudentId: string | null;
  downloadable: boolean;
}): { allowed: boolean; status: number; reason: string } {
  if (!params.currentStudentId) {
    return { allowed: false, status: 401, reason: 'Giriş yapın' };
  }
  if (!params.mediaStudentId || params.mediaStudentId !== params.currentStudentId) {
    return { allowed: false, status: 403, reason: 'Erişim yok' };
  }
  if (!params.downloadable) {
    return { allowed: false, status: 403, reason: 'Bu medya henüz açılmadı' };
  }
  return { allowed: true, status: 200, reason: 'OK' };
}

describe('İndirme erişim kontrolü', () => {
  const STUDENT_A = 'uuid-student-a';
  const STUDENT_B = 'uuid-student-b';

  it('giriş yapılmamışsa 401 döner', () => {
    const r = checkDownloadAccess({ mediaStudentId: STUDENT_A, currentStudentId: null, downloadable: true });
    expect(r.status).toBe(401);
    expect(r.allowed).toBe(false);
  });

  it('başka öğrencinin medyasına erişilemez (403)', () => {
    const r = checkDownloadAccess({ mediaStudentId: STUDENT_A, currentStudentId: STUDENT_B, downloadable: true });
    expect(r.status).toBe(403);
    expect(r.allowed).toBe(false);
  });

  it('downloadable=false ise 403 döner', () => {
    const r = checkDownloadAccess({ mediaStudentId: STUDENT_A, currentStudentId: STUDENT_A, downloadable: false });
    expect(r.status).toBe(403);
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain('açılmadı');
  });

  it('kendi medyası + downloadable=true → erişim açık', () => {
    const r = checkDownloadAccess({ mediaStudentId: STUDENT_A, currentStudentId: STUDENT_A, downloadable: true });
    expect(r.status).toBe(200);
    expect(r.allowed).toBe(true);
  });

  it('student_id null ise 403 döner', () => {
    const r = checkDownloadAccess({ mediaStudentId: null, currentStudentId: STUDENT_A, downloadable: true });
    expect(r.status).toBe(403);
  });
});

// ─── r2Configured mantığı ────────────────────────────────────────────────────

describe('R2 yapılandırma kontrolü', () => {
  it('tüm env değerleri varsa configured=true', () => {
    const cfg = { account: 'a', key: 'k', secret: 's', bucket: 'b' };
    const configured = !!(cfg.account && cfg.key && cfg.secret && cfg.bucket);
    expect(configured).toBe(true);
  });

  it('herhangi biri eksikse configured=false', () => {
    const cfg = { account: 'a', key: '', secret: 's', bucket: 'b' };
    const configured = !!(cfg.account && cfg.key && cfg.secret && cfg.bucket);
    expect(configured).toBe(false);
  });
});
