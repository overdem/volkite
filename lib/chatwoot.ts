// Chatwoot conversation history → Claude messages.
//
// The `message_created` webhook payload only carries the latest message, so the
// agent must pull the FULL thread from the Chatwoot API and replay it to Claude
// on every turn — otherwise it loses context and restarts the conversation.

export type ClaudeRole = 'user' | 'assistant';
export type ClaudeMessage = { role: ClaudeRole; content: string };

// Raw message shape returned by GET …/conversations/{id}/messages (`payload[]`).
// message_type: 0 = incoming (contact), 1 = outgoing (bot/agent),
//               2 = activity, 3 = template. We keep only 0/1, drop private notes.
export type CwApiMessage = {
  id?: number;
  content?: string | null;
  message_type?: number;
  private?: boolean;
  created_at?: number;
};

/**
 * Map raw Chatwoot messages to chronologically-ordered Claude turns.
 * - keeps only incoming (→user) and outgoing (→assistant)
 * - skips private notes and activity/template messages
 * - drops empty content
 * - sorts by created_at, falling back to id
 */
export function mapChatwootMessages(raw: CwApiMessage[]): ClaudeMessage[] {
  return raw
    .filter(
      (m) =>
        (m.message_type === 0 || m.message_type === 1) &&
        m.private !== true &&
        (m.content ?? '').trim().length > 0
    )
    .slice()
    .sort((a, b) => (a.created_at ?? a.id ?? 0) - (b.created_at ?? b.id ?? 0))
    .map((m) => ({
      role: (m.message_type === 0 ? 'user' : 'assistant') as ClaudeRole,
      content: (m.content ?? '').trim(),
    }));
}

/**
 * Normalize a chronological turn list into a valid Claude `messages` array:
 * - drops leading assistant turns (Claude requires the first turn to be `user`)
 * - merges consecutive same-role turns (Claude requires alternating roles)
 */
export function normalizeForClaude(history: ClaudeMessage[]): ClaudeMessage[] {
  let start = 0;
  while (start < history.length && history[start].role === 'assistant') start++;

  const merged: ClaudeMessage[] = [];
  for (const m of history.slice(start)) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content = `${last.content}\n${m.content}`;
    } else {
      merged.push({ role: m.role, content: m.content });
    }
  }
  return merged;
}

/**
 * Full pipeline: raw Chatwoot payload → Claude-ready messages.
 * `currentContent` is the triggering incoming message; if a read-replica lag
 * means the API hasn't indexed it yet, it's appended so the latest user turn
 * is never lost. Falls back to a single user turn if history is empty.
 */
export function buildClaudeMessages(
  raw: CwApiMessage[],
  currentContent: string
): ClaudeMessage[] {
  const current = (currentContent ?? '').trim();
  const history = mapChatwootMessages(raw);

  if (current && !history.some((m) => m.role === 'user' && m.content === current)) {
    history.push({ role: 'user', content: current });
  }

  const normalized = normalizeForClaude(history);
  if (normalized.length > 0) return normalized;
  return current ? [{ role: 'user', content: current }] : [];
}
