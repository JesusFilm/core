// Join observations to their traces and group into conversations.
//
// Pure: no IO. Message shape confirmed against the live Langfuse API:
// observation `input` is [{ role, content: [{ type:'text', text }] }] and
// `output` is a plain string. The extractors target that shape with a small
// string-content fallback.

import type {
  Conversation,
  ConversationTurn,
  ObservationRecord,
  TraceRecord
} from '../types'

export interface NormalizeOptions {
  // Load-test exclusion (deployment-env filtering happens earlier, at fetch
  // time — see FetchOptions.environment). A turn is excluded if its user
  // message matches the regex, or its trace's journeyId / any tag is in the
  // exclude sets.
  excludeMessageRegex?: RegExp
  excludeJourneyIds?: Set<string>
  excludeTags?: Set<string>
}

export interface NormalizeResult {
  conversations: Conversation[]
  excludedTurnCount: number
}

// Join message content to text. Langfuse stores content as a
// [{ type: 'text', text }] parts array (confirmed against the live API);
// we also accept a plain string.
function contentToText(content: unknown): string {
  if (typeof content === 'string') return content.trim()
  if (!Array.isArray(content)) return ''
  return content
    .map((part) =>
      part != null &&
      typeof part === 'object' &&
      typeof (part as Record<string, unknown>).text === 'string'
        ? ((part as Record<string, unknown>).text as string)
        : ''
    )
    .filter((text) => text.length > 0)
    .join(' ')
    .trim()
}

// Latest user message from a generation's input. Input is an array of
// { role, content } messages (confirmed shape); only `role: 'user'` entries
// count, so assistant/system text is never attributed to the user.
export function extractLatestUserMessage(input: unknown): string {
  if (typeof input === 'string') return input.trim()
  if (!Array.isArray(input)) return ''
  for (let index = input.length - 1; index >= 0; index -= 1) {
    const message = input[index]
    if (
      message != null &&
      typeof message === 'object' &&
      (message as Record<string, unknown>).role === 'user'
    ) {
      const text = contentToText((message as Record<string, unknown>).content)
      if (text.length > 0) return text
    }
  }
  return ''
}

// Assistant reply from a generation's output. Output is a plain string
// (confirmed shape); we also tolerate a parts array or a { content } object.
export function extractAssistantReply(output: unknown): string {
  if (typeof output === 'string') return output.trim()
  if (Array.isArray(output)) return contentToText(output)
  if (output != null && typeof output === 'object') {
    return contentToText((output as Record<string, unknown>).content)
  }
  return ''
}

function toTurn(observation: ObservationRecord): ConversationTurn {
  return {
    observationId: observation.id,
    traceId: observation.traceId,
    startTime: observation.startTime,
    userMessage: extractLatestUserMessage(observation.inputRaw),
    assistantReply: extractAssistantReply(observation.outputRaw),
    model: observation.model,
    latencySeconds: observation.latencySeconds,
    inputTokens: observation.inputTokens,
    outputTokens: observation.outputTokens,
    totalTokens: observation.totalTokens,
    costUsd: observation.costUsd
  }
}

// Cap the text a custom `--discriminator message:<regex>` is tested against.
// The regex is engineer-supplied and runs against chat content, so a
// pathological pattern could backtrack catastrophically on a long message;
// bounding the input is cheap defence-in-depth (use anchored patterns).
const MAX_DISCRIMINATOR_TEST_CHARS = 2000

function isExcluded(
  turn: ConversationTurn,
  trace: TraceRecord | undefined,
  options: NormalizeOptions
): boolean {
  if (
    options.excludeMessageRegex != null &&
    turn.userMessage.length > 0 &&
    options.excludeMessageRegex.test(
      turn.userMessage.slice(0, MAX_DISCRIMINATOR_TEST_CHARS)
    )
  ) {
    return true
  }
  if (trace == null) return false
  if (
    options.excludeJourneyIds != null &&
    trace.journeyId != null &&
    options.excludeJourneyIds.has(trace.journeyId)
  ) {
    return true
  }
  if (options.excludeTags != null) {
    for (const tag of trace.tags) {
      if (options.excludeTags.has(tag)) return true
    }
  }
  return false
}

export function normalize(
  traces: TraceRecord[],
  observations: ObservationRecord[],
  options: NormalizeOptions = {}
): NormalizeResult {
  const traceById = new Map<string, TraceRecord>()
  for (const trace of traces) traceById.set(trace.id, trace)

  // Group key -> conversation accumulator. Real sessionId groups multiple
  // traces; a null sessionId falls back to a synthetic per-trace key so
  // distinct null-session traces never collapse together. Observations
  // whose trace is absent get a synthetic per-observation orphan key.
  const groups = new Map<
    string,
    {
      trace: TraceRecord | undefined
      synthetic: boolean
      turns: ConversationTurn[]
    }
  >()
  let excludedTurnCount = 0

  for (let index = 0; index < observations.length; index += 1) {
    const observation = observations[index]
    const trace = traceById.get(observation.traceId)
    const turn = toTurn(observation)

    if (isExcluded(turn, trace, options)) {
      excludedTurnCount += 1
      continue
    }

    let key: string
    let synthetic: boolean
    if (trace == null) {
      // Fall back to the loop index when the observation has no id, so
      // distinct id-less orphans don't collapse into one `orphan:` group.
      key = `orphan:${observation.id.length > 0 ? observation.id : `idx-${index}`}`
      synthetic = true
    } else if (trace.sessionId != null) {
      key = `session:${trace.sessionId}`
      synthetic = false
    } else {
      key = `trace:${trace.id}`
      synthetic = true
    }

    const existing = groups.get(key)
    if (existing == null) {
      groups.set(key, { trace, synthetic, turns: [turn] })
    } else {
      existing.turns.push(turn)
    }
  }

  const conversations: Conversation[] = []
  for (const [key, group] of groups) {
    const turns = group.turns
      .slice()
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
    const trace = group.trace
    conversations.push({
      sessionId:
        trace?.sessionId ?? key.replace(/^(orphan|trace):/, 'synthetic:'),
      synthetic: group.synthetic,
      ipCountry: trace?.ipCountry,
      journeyId: trace?.journeyId,
      language: trace?.language,
      tags: trace?.tags ?? [],
      turns
    })
  }

  return { conversations, excludedTurnCount }
}

// Default load-test discriminator: matches the probe prompts the load
// harness sends (see tools/load-test). Used when --discriminator=default.
// `load[\s-]?test` already covers "load test", "load-test", and "loadtest"
// (incl. "load-test smoke"), so a separate smoke branch is unnecessary.
export const DEFAULT_LOAD_TEST_REGEX = /^\s*load[\s-]?test\b/i

// First non-empty user message in a conversation — the "what they asked".
export function firstUserMessage(conversation: {
  turns: ConversationTurn[]
}): string {
  for (const turn of conversation.turns) {
    if (turn.userMessage.trim().length > 0) return turn.userMessage.trim()
  }
  return ''
}
