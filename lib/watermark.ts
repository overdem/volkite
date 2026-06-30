import sharp from 'sharp';

// Fotoğrafı 1600px'a indir + diyagonal tiled "VOLKITE" filigranı uygula.
// Kalite 80 JPEG döner. Tipik 5MB foto → 200-400KB preview.
export async function generateWatermarkedPreview(input: Buffer): Promise<Buffer> {
  // Önce küçült (en geniş kenar 1600px)
  const resized = await sharp(input, { failOn: 'none' })
    .rotate() // EXIF orientation
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const svg = createWatermarkSvg(info.width, info.height);

  return sharp(data)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}

function createWatermarkSvg(w: number, h: number): string {
  // Çapraz tekrarlayan "VOLKITE" metni — kullanıcının silmesini zorlaştırır
  const tile = 320;
  const fontSize = Math.max(28, Math.round(Math.min(w, h) / 28));
  const cols = Math.ceil(w / tile) + 2;
  const rows = Math.ceil(h / tile) + 2;
  let texts = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tile + (r % 2 === 0 ? 0 : tile / 2);
      const y = r * tile;
      texts += `<text x="${x}" y="${y}" transform="rotate(-28 ${x} ${y})" fill="#ffffff" fill-opacity="0.28" stroke="#062131" stroke-opacity="0.15" stroke-width="1" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" letter-spacing="4">VOLKITE</text>`;
    }
  }
  // Sağ alt köşe etiketi
  const labelFs = Math.max(20, Math.round(fontSize * 0.9));
  const padding = 32;
  texts += `<rect x="${w - 240}" y="${h - 60}" width="208" height="44" rx="22" fill="#062131" fill-opacity="0.7"/>`;
  texts += `<text x="${w - padding - 8}" y="${h - 28}" text-anchor="end" fill="#14b8cf" font-family="Arial, Helvetica, sans-serif" font-size="${labelFs}" font-weight="900" letter-spacing="3">VOLKITE</text>`;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${texts}</svg>`;
}

// Preview anahtarı: `previews/<studentId>/<uuid>.jpg`
// Orijinal: `students/<studentId>/<uuid>.<ext>`
export function previewKeyFor(originalKey: string): string {
  const trimmed = originalKey.startsWith('students/') ? originalKey.slice('students/'.length) : originalKey;
  const noExt = trimmed.replace(/\.[^.]+$/, '');
  return `previews/${noExt}.jpg`;
}
