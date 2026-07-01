import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient, getUserRole } from '@/lib/supabase-server';

type Row = { conversation_id: string; role: string; content: string; created_at: string };

async function getConversations() {
  const db = createAdminClient();
  const { data } = await db
    .from('agent_messages')
    .select('conversation_id, role, content, created_at')
    .order('created_at', { ascending: false })
    .limit(2000);
  const rows = (data as Row[] | null) ?? [];

  // created_at desc → her conversation için ilk görülen = en son mesaj.
  const map = new Map<string, { id: string; last: string; lastRole: string; lastAt: string; count: number }>();
  for (const m of rows) {
    const ex = map.get(m.conversation_id);
    if (!ex) {
      map.set(m.conversation_id, {
        id: m.conversation_id,
        last: m.content,
        lastRole: m.role,
        lastAt: m.created_at,
        count: 1,
      });
    } else {
      ex.count++;
    }
  }
  return Array.from(map.values());
}

export default async function SohbetlerPage() {
  const { role } = await getUserRole();
  if (role !== 'admin') redirect('/panel');
  const convs = await getConversations();

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#07283b]">Sohbetler</h1>
        <span className="text-sm text-[#8497a1]">{convs.length} konuşma</span>
      </div>

      {convs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-[#8497a1] shadow-sm">
          Henüz sohbet yok.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-[#e4e9ee] overflow-hidden">
          {convs.map((c) => (
            <Link
              key={c.id}
              href={`/panel/sohbetler/${encodeURIComponent(c.id)}`}
              className="flex items-center gap-3 px-4 md:px-6 py-4 hover:bg-[#f5f7f9] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#07283b] truncate">
                  <span className="text-[#8497a1]">{c.lastRole === 'assistant' ? 'Ajan: ' : ''}</span>
                  {c.last}
                </p>
                <p className="text-xs text-[#8497a1] mt-0.5">{c.count} mesaj</p>
              </div>
              <span className="text-xs text-[#8497a1] shrink-0">
                {new Date(c.lastAt).toLocaleString('tr-TR', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  timeZone: 'Europe/Istanbul',
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
