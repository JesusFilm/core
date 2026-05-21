// PII scrubbing for user-authored chat content.
//
// `regexScrub` is pure and synchronous (unit-tested in isolation). `sanitize`
// applies it to user turns only — never assistant replies — and returns the
// branded `SanitisedConversation[]` that downstream code requires. The
// optional `llmScrub` is an injected callback (not an import of openrouter.ts)
// so this module stays network-free and testable; run.ts wires the real one
// only under --llm-scrub.

import type {
  Conversation,
  ConversationTurn,
  SanitisedConversation
} from '../types'

export type LlmScrub = (text: string) => Promise<string>

interface Rule {
  pattern: RegExp
  replace: string
}

// Order matters: URLs before emails (a URL can contain an @), then phones,
// then explicit declarations. All global + case-insensitive where relevant.
const RULES: Rule[] = [
  { pattern: /\bhttps?:\/\/\S+/gi, replace: '[redacted-url]' },
  { pattern: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, replace: '[redacted-email]' },
  // International (+NN ...) or national leading-zero numbers, 7+ digits.
  {
    pattern: /\+\d[\d\s().-]{6,}\d|\b0\d(?:[\s.-]?\d){6,9}\b/g,
    replace: '[redacted-phone]'
  },
  // "my name is X [Y]" — keep the lead-in, redact the capitalised name(s).
  // No `i` flag so the name class stays strict (a capital is required),
  // which keeps trailing lowercase words like "and ..." out of the match.
  {
    pattern: /\b([Mm]y name is)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g,
    replace: '$1 [redacted-name]'
  },
  // "I'm X" / "I am X" where X is a capitalised word — redact the name.
  {
    pattern: /\b(I['’]m|I am)\s+[A-Z][a-z]+/g,
    replace: '$1 [redacted-name]'
  },
  // "I live in X" / "I'm from X" / "I am from X" — redact the capitalised place.
  {
    pattern: /\b([Ii] live in|I['’]m from|I am from)\s+[A-Z][a-z]+/g,
    replace: '$1 [redacted-location]'
  }
]

export function regexScrub(text: string): string {
  let scrubbed = text
  for (const rule of RULES) {
    scrubbed = scrubbed.replace(rule.pattern, rule.replace)
  }
  return scrubbed
}

async function scrubTurn(
  turn: ConversationTurn,
  llmScrub?: LlmScrub
): Promise<ConversationTurn> {
  let userMessage = regexScrub(turn.userMessage)
  if (llmScrub != null && userMessage.length > 0) {
    userMessage = await llmScrub(userMessage)
  }
  // Assistant replies are never scrubbed — they are model output, not PII.
  return { ...turn, userMessage }
}

export async function sanitize(
  conversations: Conversation[],
  llmScrub?: LlmScrub
): Promise<SanitisedConversation[]> {
  const result: Conversation[] = []
  for (const conversation of conversations) {
    const turns: ConversationTurn[] = []
    for (const turn of conversation.turns) {
      turns.push(await scrubTurn(turn, llmScrub))
    }
    result.push({ ...conversation, turns })
  }
  // The only place a SanitisedConversation is minted.
  return result as SanitisedConversation[]
}
