// Agent system prompt — Supabase-backed, deploy-free updates.
//
// The prompt lives in the ai_prompts table (key='web-agent'). We cache it
// in-module for 60 minutes so updates propagate without a redeploy, and fall
// back to the code's SYSTEM_STATIC if Supabase is unavailable.
//
// Note: the cache is per serverless instance. The 60-min TTL guarantees
// propagation; clearPromptCache() (via /api/agent/refresh) clears the instance
// that receives the call for an immediate refresh.

import { createClient } from '@supabase/supabase-js';

const PROMPT_KEY = 'web-agent';
const TTL_MS = 60 * 60 * 1000; // 60 dk

let cache: { content: string; fetchedAt: number } | null = null;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/** Force the next getSystemPrompt() to re-read from Supabase (this instance). */
export function clearPromptCache(): void {
  cache = null;
}

/**
 * Return the web-agent system prompt. Served from the 60-min cache when fresh;
 * otherwise fetched from Supabase. On any failure, returns the last cached value
 * or the provided code fallback.
 */
export async function getSystemPrompt(fallback: string): Promise<string> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < TTL_MS) return cache.content;

  try {
    const { data, error } = await db()
      .from('ai_prompts')
      .select('content')
      .eq('key', PROMPT_KEY)
      .single();

    if (error || !data?.content) {
      console.log('prompt fetch failed, using fallback:', error?.message);
      return cache?.content ?? fallback;
    }

    cache = { content: data.content as string, fetchedAt: now };
    return cache.content;
  } catch (e) {
    console.log('prompt fetch error, using fallback:', e);
    return cache?.content ?? fallback;
  }
}
