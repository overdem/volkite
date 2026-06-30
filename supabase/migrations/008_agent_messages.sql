-- Volkite · Ajan konuşma hafızası (kendi web sohbet widget'ımız)
--
-- Widget her mesajda tarayıcıda üretilen conversation_id'yi gönderir; gelen
-- kullanıcı mesajı ve ajan cevabı buraya yazılır, sonraki turda created_at
-- sırasıyla okunup Claude'a replay edilir. Böylece bağlam korunur.

create table if not exists agent_messages (
  id              bigint generated always as identity primary key,
  conversation_id text not null,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz default now()
);

-- Konuşma bazlı kronolojik okuma için
create index if not exists agent_messages_conv_idx
  on agent_messages (conversation_id, created_at);

-- Yalnızca service_role (ajan endpoint'i) erişir; RLS açık, public policy yok.
alter table agent_messages enable row level security;
