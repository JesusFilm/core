// Join observations to their traces and group into conversations.
//
// Pure: no IO. The text extractors are deliberately tolerant — the live
// observation `input`/`output` shape is unverified (plan Open Questions),
// so we handle string content, content-parts arrays, and AI-SDK
// ModelMessage shapes without assuming any one of them.

import type {
  Conversation,
  ConversationTurn,
  ObservationRecord,
  TraceRecord
} from './types'

export interface NormalizeOptions {
  // Load-test exclusion (the `--environment` filter is inert until NES-1688;
  // see plan). A turn is excluded if its user message matches the regex, or
  // its trace's journeyId / any tag is in the exclude sets.
  excludeMessageRegex?: RegExp
  excludeJourneyIds?: Set<string>
  excludeTags?: Set<string>
}

export interface NormalizeResult {
  conversations: Conversation[]
  excludedTurnCount: number
}

function partsText(parts: unknown): string {
  if (!Array.isArray(parts)) return ''
  return parts
    .map((part) => {
      if (typeof part === 'string') return part
      if (part != null && typeof part === 'object') {
        const text = (part as Record<string, unknown>).text
        if (typeof text === 'string') return text
      }
      return ''
    })
    .filter((text) => text.length > 0)
    .join(' ')
    .trim()
}

// Text of a single message-like value (string, {content}, {text}, or parts).
function messageText(message: unknown): string {
  if (typeof message === 'string') return message.trim()
  if (message != null && typeof message === 'object') {
    const record = message as Record<string, unknown>
    if (typeof record.content === 'string') return record.content.trim()
    if (Array.isArray(record.content)) return partsText(record.content)
    if (typeof record.text === 'string') return record.text.trim()
  }
  return ''
}

// Latest user-authored message from a generation's input. When the input is
// an array of messages, only `role: 'user'` entries are considered — we never
// fall back to the last element regardless of role, since that would attribute
// assistant/system/tool text as the user's question (and leak it downstream).
export function extractLatestUserMessage(input: unknown): string {
  if (Array.isArray(input)) {
    for (let index = input.length - 1; index >= 0; index -= 1) {
      const message = input[index]
      if (
        message != null &&
        typeof message === 'object' &&
        (message as Record<string, unknown>).role === 'user'
      ) {
        const text = messageText(message)
        if (text.length > 0) return text
      }
    }
    return ''
  }
  // A bare (non-array) input has no role to check — treat it as the message.
  return messageText(input)
}

// Assistant reply from a generation's output.
export function extractAssistantReply(output: unknown): string {
  if (Array.isArray(output)) {
    for (let index = output.length - 1; index >= 0; index -= 1) {
      const message = output[index]
      if (
        message != null &&
        typeof message === 'object' &&
        (message as Record<string, unknown>).role === 'assistant'
      ) {
        const text = messageText(message)
        if (text.length > 0) return text
      }
    }
    return partsText(output)
  }
  return messageText(output)
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
    { trace: TraceRecord | undefined; synthetic: boolean; turns: ConversationTurn[] }
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
