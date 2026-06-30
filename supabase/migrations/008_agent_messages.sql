-- Volkite · Ajan konuşma geçmişi
--
-- Chatwoot agent bot token'ı mesaj listeleme API'sine erişemiyor
-- ("Access to this endpoint is not authorized for bots"). Bu yüzden ajan
-- geçmişi burada tutuyoruz: her webhook'ta gelen kullanıcı mesajı ve bizim
-- ürettiğimiz cevap conversation_id ile kaydedilir, sonraki turda replay edilir.

create table if not exists agent_messages (
  id              bigint generated always as identity primary key,
  conversation_id text not null,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz default now()
);

-- Konuşma bazlı kronolojik okuma için
create index if not exists agent_messages_conv_idx
  on agent_messages (conversation_id, id);

-- Yalnızca service_role (ajan endpoint'i) erişir; RLS açık, public policy yok.
alter table agent_messages enable row level security;
