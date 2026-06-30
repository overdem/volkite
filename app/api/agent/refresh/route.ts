import { NextRequest, NextResponse } from 'next/server';
import { clearPromptCache } from '@/lib/agent-prompt';

// Manual prompt-cache purge. Clears the cache on the serverless instance that
// receives the call, so the next chat re-reads the prompt from Supabase
// immediately (instead of waiting for the 60-min TTL). Low-traffic sites
// usually run one warm instance, so this is effective in practice.
//
// Protected by PROMPT_REFRESH_SECRET; if the env var is unset the endpoint is
// disabled (purge relies on the TTL instead).
export async function POST(req: NextRequest) {
  const secret = process.env.PROMPT_REFRESH_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }
  const provided =
    req.nextUrl.searchParams.get('secret') ?? req.headers.get('x-refresh-secret');
  if (provided !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  clearPromptCache();
  return NextResponse.json({ ok: true, cleared: true });
}
