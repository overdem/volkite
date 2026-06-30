// Agent conversation history → Claude messages.
//
// Our web chat widget sends a browser-generated conversation_id with every
// message. We persist the thread in Supabase (agent_messages) and replay it to
// Claude on each turn so context is preserved. This module shapes stored rows
// into a valid Claude `messages` array.

export type ClaudeRole = 'user' | 'assistant';
export type ClaudeMessage = { role: ClaudeRole; content: string };

// A row from the agent_messages table (role already 'user'|'assistant').
export type StoredMessage = { role: string; content: string | null };

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
 * Build a Claude-ready messages array from stored history plus the triggering
 * message. `currentContent` is appended as a user turn if it isn't already
 * present (guards against the order in which we persist vs. read history).
 * Falls back to a single user turn if history is empty.
 */
export function buildClaudeMessages(
  history: StoredMessage[],
  currentContent: string
): ClaudeMessage[] {
  const current = (currentContent ?? '').trim();

  const mapped: ClaudeMessage[] = history
    .filter(
      (m) =>
        (m.role === 'user' || m.role === 'assistant') &&
        (m.content ?? '').trim().length > 0
    )
    .map((m) => ({ role: m.role as ClaudeRole, content: (m.content ?? '').trim() }));

  if (current && !mapped.some((m) => m.role === 'user' && m.content === current)) {
    mapped.push({ role: 'user', content: current });
  }

  const normalized = normalizeForClaude(mapped);
  if (normalized.length > 0) return normalized;
  return current ? [{ role: 'user', content: current }] : [];
}
