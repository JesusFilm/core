// OpenRouter access via the AI SDK (mirrors apps/journeys/pages/api/chat).
//
// Three responsibilities, all content-bearing and therefore network/trust-
// boundary crossing:
//   - synthesizeThemes: theme LABELS + group assignments only (never excerpt
//     text — the explorer renders message text verbatim from the sanitised
//     records).
//   - createLlmScrub: the optional --llm-scrub primitive, injected into
//     sanitize.ts by run.ts.
//   - translateTexts: the --translate pass (NES-1762). Detects each string's
//     language and, when it isn't English, translates it into English. The
//     original text is never replaced — translation is additive downstream.
// All accept only SanitisedConversation / already-scrubbed text.

import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { generateText, type LanguageModel } from 'ai'

import type { ToolEnv } from '../env'
import { firstUserMessage } from '../pipeline/normalize'
import { cannotBeEnglish } from '../pipeline/translate'
import type {
  SanitisedConversation,
  ThemeSynthesis,
  Translation
} from '../types'

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
const MAX_THEME_CONVERSATIONS = 150
const MAX_MESSAGE_CHARS = 300
// Per-call deadline so a stalled OpenRouter connection can't hang the run.
const DEFAULT_TIMEOUT_MS = 60_000

// Translation batching: aim for ~6000 chars per request so long assistant
// replies don't blow a single prompt, with a hard item cap. A single item that
// exceeds the budget still gets sent whole (never truncated) in its own batch —
// a truncated translation is a wrong translation.
const TRANSLATION_CHAR_BUDGET = 6000
const TRANSLATION_MAX_ITEMS = 30
// Retry with exponential backoff on failure (openrouter has no retry otherwise
// — only the per-call timeout). Mirrors src/clients/langfuse.ts.
const MAX_REQUEST_RETRIES = 4
const RETRY_BASE_MS = 800

const sleep = (ms: number): Promise<void> =>
  new Promise((res) => setTimeout(res, ms))

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
    'paraphrase, or invent any message text — only labels and id groupings. ' +
    'Write every theme label in English, even when the conversations are in ' +
    'another language — the report is read by English speakers.'

  const { text } = await generateText({
    model,
    system,
    prompt: `Conversations (id :: first user message):\n${list}`,
    abortSignal: options.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
  })

  return parseThemes(text, validIds)
}

// Pure parse of the model's translation JSON. Mirrors parseThemes: throws on
// structurally unusable output (the caller retries, then degrades). Reuses
// extractJsonObject. Per-entry rules enforce that we never claim a translation
// we don't have:
//   - drop ids not in validIds (hallucinated);
//   - drop entries with a missing/empty `lang`;
//   - lowercase the language code;
//   - lang 'en' means "no translation" — record {sourceLanguage:'en'} with NO
//     `english`, even if the model wrongly supplied an `en` field;
//   - drop non-'en' entries whose `en` is missing/empty.
export function parseTranslations(
  text: string,
  validIds: Set<string>
): Map<string, Translation> {
  const parsed = extractJsonObject(text) as { items?: unknown }
  if (!Array.isArray(parsed.items)) {
    throw new Error('model output missing items array')
  }
  const result = new Map<string, Translation>()
  for (const entry of parsed.items) {
    const record = entry as Record<string, unknown>
    const id = typeof record.id === 'string' ? record.id : ''
    if (!validIds.has(id)) continue
    const lang =
      typeof record.lang === 'string' ? record.lang.trim().toLowerCase() : ''
    if (lang.length === 0) continue
    if (lang === 'en') {
      // English source: detection only, nothing translated. Ignore any `en`
      // the model wrongly supplied.
      result.set(id, { sourceLanguage: 'en' })
      continue
    }
    const english = typeof record.en === 'string' ? record.en.trim() : ''
    // A non-English entry without an actual translation is unusable.
    if (english.length === 0) continue
    result.set(id, { sourceLanguage: lang, english })
  }
  return result
}

const TRANSLATION_SYSTEM_PROMPT =
  'You translate short messages from a Christian apologetics chat corpus into ' +
  'English. For each item you are given, detect the language of its text. If ' +
  'the text is already English, return {"id":"<id>","lang":"en"} and OMIT the ' +
  '"en" field. If it is not English, translate it into natural English and ' +
  'return {"id":"<id>","lang":"<detected-language-code>","en":"<translation>"}. ' +
  'Return ONLY JSON of the form ' +
  '{"items":[{"id":"...","lang":"...","en":"..."}]}. Use the exact ids given. ' +
  'Preserve the meaning exactly — do not summarise, censor, expand, or add ' +
  'commentary. Religious terms must be rendered with their standard English ' +
  'equivalents.'

// Split items into batches within a character budget so long assistant replies
// don't blow a single prompt, hard-capping the item count. A single item over
// the budget still gets sent whole (its own batch) — never truncated.
function batchByCharBudget(
  items: Array<{ id: string; text: string }>
): Array<Array<{ id: string; text: string }>> {
  const batches: Array<Array<{ id: string; text: string }>> = []
  let current: Array<{ id: string; text: string }> = []
  let currentChars = 0
  for (const item of items) {
    const exceedsChars =
      current.length > 0 &&
      currentChars + item.text.length > TRANSLATION_CHAR_BUDGET
    const exceedsCount = current.length >= TRANSLATION_MAX_ITEMS
    if (exceedsChars || exceedsCount) {
      batches.push(current)
      current = []
      currentChars = 0
    }
    current.push(item)
    currentChars += item.text.length
  }
  if (current.length > 0) batches.push(current)
  return batches
}

// One generateText per batch, with exponential-backoff retry. Throws if every
// attempt fails so the caller can degrade the batch (never fabricate).
async function translateBatch(
  model: LanguageModel,
  batch: Array<{ id: string; text: string }>,
  signal: AbortSignal | undefined,
  strict = false
): Promise<Map<string, Translation>> {
  const validIds = new Set(batch.map((item) => item.id))
  const prompt = batch
    .map((item) => JSON.stringify({ id: item.id, text: item.text }))
    .join('\n')
  const system = strict
    ? `${TRANSLATION_SYSTEM_PROMPT} These items are definitely NOT English — ` +
      'they are written in a non-Latin script. Identify the actual language and ' +
      'translate. Do not answer "en".'
    : TRANSLATION_SYSTEM_PROMPT
  for (let attempt = 0; ; attempt += 1) {
    try {
      const { text } = await generateText({
        model,
        system,
        prompt: `Items (one JSON object per line):\n${prompt}`,
        abortSignal: signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
      })
      const parsed = parseTranslations(text, validIds)
      // Reject verdicts that script alone disproves. Better to return nothing
      // for the item (it stays untranslated, and uncached) than to record and
      // cache "this Bengali paragraph is English".
      for (const item of batch) {
        const record = parsed.get(item.id)
        if (record?.sourceLanguage === 'en' && cannotBeEnglish(item.text)) {
          parsed.delete(item.id)
        }
      }
      return parsed
    } catch (error) {
      if (attempt >= MAX_REQUEST_RETRIES) throw error
      await sleep(RETRY_BASE_MS * 2 ** attempt)
    }
  }
}

// Detect + translate a set of strings. Returns a Map keyed by each item's id.
// A batch that fails after all retries is left out of the Map (those items stay
// untranslated) and a warning is logged — the run never throws or fabricates.
//
// Input MUST be already-sanitised text — this is the module's trust boundary.
export async function translateTexts(
  model: LanguageModel,
  items: Array<{ id: string; text: string }>,
  options: { signal?: AbortSignal; onProgress?: (message: string) => void } = {}
): Promise<Map<string, Translation>> {
  const translations = new Map<string, Translation>()
  const batches = batchByCharBudget(items)
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index]
    options.onProgress?.(
      `translate: batch ${index + 1}/${batches.length} (${batch.length} items)`
    )
    try {
      const parsed = await translateBatch(model, batch, options.signal)
      for (const [id, translation] of parsed) translations.set(id, translation)
    } catch (error) {
      // Degrade: leave this batch untranslated rather than aborting the run.
      // The original text is always retained downstream.
      console.warn(
        `[langfuse-export] translation batch ${index + 1}/${batches.length} failed ` +
          `(${error instanceof Error ? error.message : String(error)}) — ` +
          `leaving ${batch.length} item(s) untranslated`
      )
    }
  }

  // A batch can SUCCEED and still omit an item (the model skips it, or returns
  // a non-English entry with no translation, which parseTranslations discards).
  // The batch-level retry cannot catch that, so sweep the stragglers one at a
  // time — alone in a prompt, a skipped item almost always comes back.
  const missing = items.filter((item) => !translations.has(item.id))
  if (missing.length > 0) {
    options.onProgress?.(
      `translate: retrying ${missing.length} skipped item(s)`
    )
    for (const item of missing) {
      try {
        const parsed = await translateBatch(
          model,
          [item],
          options.signal,
          cannotBeEnglish(item.text)
        )
        for (const [id, translation] of parsed)
          translations.set(id, translation)
      } catch {
        // Leave it untranslated; the original always survives.
      }
    }
  }

  return translations
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
