// Telefon numarasını wa.me linkine çevir. Boş/geçersizse null döner.
// TR varsayımı: 0 ile başlayan 11 haneyi 90'a çevir; 10 haneyi 90 ekle.
export function waLink(raw: string | null | undefined, prefill?: string): string | null {
  if (!raw) return null;
  let d = String(raw).replace(/[^\d]/g, '');
  if (!d) return null;
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = '90' + d.slice(1);
  else if (d.length === 10) d = '90' + d; // ülke kodu yok, TR varsay
  if (d.length < 11 || d.length > 15) return null;
  const q = prefill ? `?text=${encodeURIComponent(prefill)}` : '';
  return `https://wa.me/${d}${q}`;
}
