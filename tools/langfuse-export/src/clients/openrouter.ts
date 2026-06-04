// OpenRouter access via the AI SDK (mirrors apps/journeys/pages/api/chat).
//
// Two responsibilities, both content-bearing and therefore network/trust-
// boundary crossing:
//   - synthesizeThemes: theme LABELS + group assignments only (never excerpt
//     text — the explorer renders message text verbatim from the sanitised
//     records).
//   - createLlmScrub: the optional --llm-scrub primitive, injected into
//     sanitize.ts by run.ts.
// Both accept only SanitisedConversation / already-scrubbed text.

import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText, type LanguageModel } from 'ai'

import type { ToolEnv } from '../env'
import { firstUserMessage } from '../pipeline/normalize'
import type { SanitisedConversation, ThemeSynthesis } from '../types'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MAX_THEME_CONVERSATIONS = 150
const MAX_MESSAGE_CHARS = 300
// Per-call deadline so a stalled OpenRouter connection can't hang the run.
const DEFAULT_TIMEOUT_MS = 60_000

export function createModel(env: ToolEnv): LanguageModel {
  const openrouter = createOpenAICompatible({
    name: 'openrouter',
    baseURL: OPENROUTER_BASE_URL,
    apiKey: env.openrouterApiKey,
    headers: { 'X-Title': 'langfuse-export (NES-1690)' }
  })
  return openrouter.chatModel(env.openrouterModel)
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced != null ? fenced[1] : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('no JSON object found in model output')
  }
  return JSON.parse(candidate.slice(start, end + 1))
}

// Pure parse of the model's theme JSON. Throws on unusable output (the caller
// degrades to stats-only). Hallucinated ids are dropped via validIds, and
// label-less / empty themes are filtered. Extracted from synthesizeThemes so
// the LLM-output boundary is unit-testable without the network.
export function parseThemes(
  text: string,
  validIds: Set<string>
): ThemeSynthesis {
  const parsed = extractJsonObject(text) as { themes?: unknown }
  if (!Array.isArray(parsed.themes)) {
    throw new Error('model output missing themes array')
  }
  const themes = parsed.themes
    .map((theme) => {
      const record = theme as Record<string, unknown>
      const label = typeof record.label === 'string' ? record.label.trim() : ''
      const sessionIds = Array.isArray(record.sessionIds)
        ? [
            ...new Set(
              record.sessionIds.filter(
                (id): id is string => typeof id === 'string' && validIds.has(id)
              )
            )
          ]
        : []
      return { label, sessionIds }
    })
    .filter((theme) => theme.label.length > 0 && theme.sessionIds.length > 0)
  return { themes }
}

// Ask the model to label and group conversations. Returns labels + the
// sessionIds in each theme — NEVER excerpt text.
export async function synthesizeThemes(
  model: LanguageModel,
  sanitised: SanitisedConversation[],
  options: { signal?: AbortSignal } = {}
): Promise<ThemeSynthesis> {
  const eligible = sanitised
    .filter((conversation) => firstUserMessage(conversation).length > 0)
    .slice(0, MAX_THEME_CONVERSATIONS)

  if (eligible.length === 0) return { themes: [] }

  const validIds = new Set(
    eligible.map((conversation) => conversation.sessionId)
  )
  const list = eligible
    .map((conversation) => {
      const message = firstUserMessage(conversation).slice(0, MAX_MESSAGE_CHARS)
      return `- id=${conversation.sessionId} :: ${message}`
    })
    .join('\n')

  const system =
    'You group user questions from a Christian apologetics chat into themes. ' +
    'Return ONLY JSON of the form {"themes":[{"label":"short theme name",' +
    '"sessionIds":["id1","id2"]}]}. Use the exact ids given. Do NOT quote, ' +
    'paraphrase, or invent any message text — only labels and id groupings.'

  const { text } = await generateText({
    model,
    system,
    prompt: `Conversations (id :: first user message):\n${list}`,
    abortSignal: options.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
  })

  return parseThemes(text, validIds)
}

// The optional --llm-scrub primitive. Returns a single-message scrubber that
// run.ts injects into sanitize.ts. Input is already regex-scrubbed.
export function createLlmScrub(
  model: LanguageModel
): (text: string) => Promise<string> {
  return async (text: string): Promise<string> => {
    try {
      const { text: cleaned } = await generateText({
        model,
        system:
          'Remove any remaining personal identifying information (names, ' +
          'locations, contact details, anything that could identify the ' +
          'speaker or a third party) from the user message. Preserve the ' +
          'meaning and question. Return ONLY the cleaned message text, nothing else.',
        prompt: text,
        abortSignal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
      })
      return cleaned.trim().length > 0 ? cleaned.trim() : text
    } catch (error) {
      // Degrade to the already regex-scrubbed input rather than aborting the
      // whole run on a single scrub failure (mirrors the synthesizeThemes
      // degradation in run.ts). The input is regex-scrubbed, so this is safe.
      console.warn(
        `[langfuse-export] llm-scrub failed for one message (${error instanceof Error ? error.message : String(error)}) — keeping regex-scrubbed text`
      )
      return text
    }
  }
}
