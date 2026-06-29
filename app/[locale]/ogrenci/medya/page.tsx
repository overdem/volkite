import { createAuthClient, createAdminClient } from '@/lib/supabase-server';

async function getStudentMedia(email: string) {
  const db = createAdminClient();
  const { data: student } = await db
    .from('students')
    .select('id')
    .eq('email', email)
    .single();
  if (!student) return [];

  const { data } = await db
    .from('student_media')
    .select('id, type, preview_key, thumb_key, downloadable, created_at')
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export default async function OgrenciMedyaPage() {
  const auth = await createAuthClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user?.email) return null;

  const media = await getStudentMedia(user.email);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#07283b]">Medyam</h1>
        <p className="text-sm text-[#8497a1] mt-1">
          Ders sırasında çekilen fotoğraf ve videoların
        </p>
      </div>

      {media.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#8497a1] shadow-sm">
          <p className="text-lg mb-2">Henüz medya eklenmedi</p>
          <p className="text-sm">Ders sonrası fotoğraf ve videoların burada görünecek 🎬</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {media.map((m) => (
            <MediaCard key={m.id} media={m} />
          ))}
        </div>
      )}
    </div>
  );
}

type MediaItem = {
  id: string;
  type: string | null;
  preview_key: string | null;
  thumb_key: string | null;
  downloadable: boolean;
  created_at: string;
};

function MediaCard({ media }: { media: MediaItem }) {
  const previewUrl = media.preview_key
    ? `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${media.preview_key}`
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden group">
      {/* Preview */}
      <div className="aspect-square bg-[#eef1f4] relative flex items-center justify-center">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Medya önizleme"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl">{media.type === 'video' ? '🎬' : '📷'}</span>
        )}

        {/* Lock overlay for non-downloadable */}
        {!media.downloadable && (
          <div className="absolute inset-0 bg-[#062131]/60 flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3">
        <p className="text-xs text-[#8497a1] mb-2">
          {new Date(media.created_at).toLocaleDateString('tr-TR')}
          {' · '}
          {media.type === 'video' ? 'Video' : 'Fotoğraf'}
        </p>

        {media.downloadable ? (
          <a
            href={`/api/student/download/${media.id}`}
            className="block w-full text-center text-xs font-semibold bg-[#14b8cf] text-[#062131] py-1.5 rounded-lg hover:bg-[#0fa3b8] transition-colors"
          >
            İndir ↓
          </a>
        ) : (
          <div className="w-full text-center text-xs text-[#8497a1] py-1.5 rounded-lg bg-[#eef1f4]">
            Kilitli — ödeme sonrası açılır
          </div>
        )}
      </div>
    </div>
  );
}
