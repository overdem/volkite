// Handoff → WhatsApp CTA.
//
// When the agent emits [[HANDOFF]] we strip the marker from the reply and
// surface a WhatsApp button so the visitor can reach Volkan directly.

export const WHATSAPP_NUMBER = '905332411015';

const HANDOFF_TAG = '[[HANDOFF]]';

export type WhatsappCta = { url: string; label: string };

/** Detect the handoff marker and return the cleaned reply text. */
export function parseHandoff(raw: string): { reply: string; handoff: boolean } {
  const handoff = raw.includes(HANDOFF_TAG);
  const reply = raw
    .split(HANDOFF_TAG)
    .join('')
    .replace(/[ \t]{2,}/g, ' ') // collapse spaces left where the tag was
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { reply, handoff };
}

/** Build a wa.me link with a pre-filled message. */
export function buildWhatsappCta(label: string, prefill: string): WhatsappCta {
  return {
    url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(prefill)}`,
    label,
  };
}
