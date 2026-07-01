import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';

type Msg = { role: string; content: string; created_at: string };

export default async function SohbetDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { role } = await getUserRole();
  if (role !== 'admin') redirect('/panel');

  const { id } = await params;
  const convId = decodeURIComponent(id);

  const db = createAdminClient();
  const { data } = await db
    .from('agent_messages')
    .select('role, content, created_at')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });
  const messages = (data as Msg[] | null) ?? [];

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <Link href="/panel/sohbetler" className="text-sm text-[#14b8cf] font-semibold">
        ← Sohbetler
      </Link>
      <h1 className="text-xl font-bold text-[#07283b] mt-2 mb-1">Konuşma</h1>
      <p className="text-xs text-[#8497a1] mb-6 break-all">{convId}</p>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-[#8497a1] shadow-sm">
          Mesaj bulunamadı.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-[#14b8cf] text-[#062131] rounded-br-md'
                      : 'bg-white text-[#07283b] border border-[#e4e9ee] rounded-bl-md'
                  }`}
                >
                  {m.content}
                  <div className={`text-[10px] mt-1 ${isUser ? 'text-[#062131]/60' : 'text-[#8497a1]'}`}>
                    {new Date(m.created_at).toLocaleString('tr-TR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      timeZone: 'Europe/Istanbul',
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
