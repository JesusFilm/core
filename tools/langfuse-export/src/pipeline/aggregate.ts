// Deterministic report statistics. Pure: no IO, no LLM. Numbers here are the
// trustworthy half of the report — the LLM never produces figures.

import type {
  DateWindow,
  RegionStats,
  ReportStats,
  SanitisedConversation,
  TopQuestion
} from '../types'

const DEFAULT_TOP_N = 20
// "Long conversation" threshold: > 10 messages exchanged. One
// ConversationTurn = one user + one assistant message, so > 10 messages
// maps to > 5 turns.
const LONG_CONVERSATION_TURNS = 5
// Cap per-region top-questions so a high-volume country doesn't blow the
// rendered report up. Global top-questions stays at DEFAULT_TOP_N.
const REGION_TOP_QUESTIONS = 10
// Buckets a missing country code under a stable key. NES-1574 captures
// ipCountry on every trace, but earlier traces and edge-cache misses can
// still land here — we surface those so the gap is visible, not silenced.
const UNKNOWN_COUNTRY = 'unknown'
const UNKNOWN_LANGUAGE = 'unknown'

function dayKey(iso: string): string {
  // YYYY-MM-DD from an ISO timestamp; '' if unparseable (the caller buckets
  // '' under 'unknown'). Validate the prefix shape so a malformed value can't
  // produce a bogus day key.
  if (iso.length < 10) return ''
  const day = iso.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : ''
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0
  if (sortedAsc.length === 1) return sortedAsc[0]
  const rank = (p / 100) * (sortedAsc.length - 1)
  const low = Math.floor(rank)
  const high = Math.ceil(rank)
  if (low === high) return sortedAsc[low]
  const weight = rank - low
  return sortedAsc[low] * (1 - weight) + sortedAsc[high] * weight
}

function increment(map: Record<string, number>, key: string, by = 1): void {
  if (key.length === 0) return
  map[key] = (map[key] ?? 0) + by
}

// Per-region accumulator. Mirrors the global counters but scoped to one
// country. `questionCounts` keys on lowercase-trimmed user message so
// near-duplicates collapse; the display message preserves original casing.
interface RegionAccumulator {
  country: string
  conversations: number
  realConversations: number
  syntheticConversations: number
  turns: number
  multiTurnConversations: number
  longConversations: number
  perLanguage: Record<string, number>
  questionCounts: Map<string, { message: string; count: number }>
  topQuestionsIncludedConversations: number
}

function emptyRegion(country: string): RegionAccumulator {
  return {
    country,
    conversations: 0,
    realConversations: 0,
    syntheticConversations: 0,
    turns: 0,
    multiTurnConversations: 0,
    longConversations: 0,
    perLanguage: {},
    questionCounts: new Map(),
    topQuestionsIncludedConversations: 0
  }
}

function finalizeRegion(region: RegionAccumulator): RegionStats {
  const share = (count: number): number =>
    region.conversations === 0 ? 0 : count / region.conversations

  const topQuestions: TopQuestion[] = Array.from(region.questionCounts.values())
    .sort((a, b) => b.count - a.count || a.message.localeCompare(b.message))
    .slice(0, REGION_TOP_QUESTIONS)

  return {
    country: region.country,
    conversations: region.conversations,
    realConversations: region.realConversations,
    syntheticConversations: region.syntheticConversations,
    turns: region.turns,
    multiTurn: {
      count: region.multiTurnConversations,
      share: share(region.multiTurnConversations)
    },
    longConversation: {
      count: region.longConversations,
      share: share(region.longConversations)
    },
    perLanguage: region.perLanguage,
    topQuestions,
    topQuestionsIncludedConversations: region.topQuestionsIncludedConversations
  }
}

// Sort regions so the report renders the highest-signal one first.
// Tie-break on country code so output is deterministic across runs.
function sortRegions(
  regions: Record<string, RegionStats>
): Record<string, RegionStats> {
  const entries = Object.entries(regions).sort(
    (a, b) =>
      b[1].conversations - a[1].conversations || a[0].localeCompare(b[0])
  )
  const sorted: Record<string, RegionStats> = {}
  for (const [key, value] of entries) sorted[key] = value
  return sorted
}

export function buildStats(
  conversations: SanitisedConversation[],
  excludedTurnCount: number,
  window: DateWindow,
  topN: number = DEFAULT_TOP_N
): ReportStats {
  const totalConversations = conversations.length

  let totalTurns = 0
  let nullSessionCount = 0
  let singleTurnCount = 0
  let totalCostUsd = 0
  let totalInputTokens = 0
  let totalOutputTokens = 0

  const perModel: Record<string, number> = {}
  const perDay: Record<string, number> = {}
  const costPerDayUsd: Record<string, number> = {}
  const conversationLengthHistogram: Record<string, number> = {}
  const latencies: number[] = []

  // Top-questions are computed only over real-session, length>1 conversations
  // so repeated single-turn load probes can't dominate (plan decision).
  const questionCounts = new Map<string, { message: string; count: number }>()
  let topQuestionsIncluded = 0

  // Per-region (NES-1577). Same eligibility for top-questions as global.
  const regions = new Map<string, RegionAccumulator>()
  const regionOf = (country: string): RegionAccumulator => {
    const existing = regions.get(country)
    if (existing != null) return existing
    const created = emptyRegion(country)
    regions.set(country, created)
    return created
  }

  for (const conversation of conversations) {
    const turnCount = conversation.turns.length
    totalTurns += turnCount
    if (conversation.synthetic) nullSessionCount += 1
    if (turnCount === 1) singleTurnCount += 1
    increment(conversationLengthHistogram, String(turnCount))

    const eligibleForQuestions = !conversation.synthetic && turnCount > 1
    if (eligibleForQuestions) topQuestionsIncluded += 1

    // Normalise the country once per conversation so empty strings, undefined,
    // and lowercase variants all land under the same bucket key.
    const country =
      conversation.ipCountry != null && conversation.ipCountry.length > 0
        ? conversation.ipCountry.toUpperCase()
        : UNKNOWN_COUNTRY
    const region = regionOf(country)
    region.conversations += 1
    if (conversation.synthetic) region.syntheticConversations += 1
    else region.realConversations += 1
    region.turns += turnCount
    if (turnCount > 1) region.multiTurnConversations += 1
    if (turnCount > LONG_CONVERSATION_TURNS) region.longConversations += 1
    if (eligibleForQuestions) region.topQuestionsIncludedConversations += 1

    const conversationLanguage =
      conversation.language != null && conversation.language.length > 0
        ? conversation.language
        : UNKNOWN_LANGUAGE

    for (const turn of conversation.turns) {
      increment(perModel, turn.model ?? 'unknown')
      // Bucket unparseable/empty timestamps under 'unknown' so the per-day
      // breakdown reconciles with the headline turn/cost totals.
      const day = dayKey(turn.startTime) || 'unknown'
      increment(perDay, day)
      if (turn.costUsd != null) {
        totalCostUsd += turn.costUsd
        increment(costPerDayUsd, day, turn.costUsd)
      }
      if (turn.inputTokens != null) totalInputTokens += turn.inputTokens
      if (turn.outputTokens != null) totalOutputTokens += turn.outputTokens
      if (turn.latencySeconds != null) latencies.push(turn.latencySeconds)

      increment(region.perLanguage, conversationLanguage)

      if (turn.userMessage.trim().length > 0) {
        const normalized = turn.userMessage.trim().toLowerCase()
        const displayMessage = turn.userMessage.trim()
        if (eligibleForQuestions) {
          const existing = questionCounts.get(normalized)
          if (existing == null) {
            questionCounts.set(normalized, {
              message: displayMessage,
              count: 1
            })
          } else {
            existing.count += 1
          }
          // Same eligibility for per-region top-questions: real-session,
          // length>1. Keeps regional noise floor consistent with global.
          const regionExisting = region.questionCounts.get(normalized)
          if (regionExisting == null) {
            region.questionCounts.set(normalized, {
              message: displayMessage,
              count: 1
            })
          } else {
            regionExisting.count += 1
          }
        }
      }
    }
  }

  latencies.sort((a, b) => a - b)

  const topQuestions: TopQuestion[] = Array.from(questionCounts.values())
    .sort((a, b) => b.count - a.count || a.message.localeCompare(b.message))
    .slice(0, topN)

  const share = (count: number): number =>
    totalConversations === 0 ? 0 : count / totalConversations

  const perRegion: Record<string, RegionStats> = {}
  for (const [country, accumulator] of regions)
    perRegion[country] = finalizeRegion(accumulator)

  return {
    windowFrom: window.from.toISOString(),
    windowTo: window.to.toISOString(),
    generatedAt: new Date().toISOString(),

    totalConversations,
    totalTurns,

    nullSession: { count: nullSessionCount, share: share(nullSessionCount) },
    singleTurn: { count: singleTurnCount, share: share(singleTurnCount) },
    excludedLoadTest: { count: excludedTurnCount },

    perModel,
    perDay,

    totalCostUsd,
    costPerDayUsd,
    totalInputTokens,
    totalOutputTokens,

    latencySeconds: {
      count: latencies.length,
      p50: percentile(latencies, 50),
      p95: percentile(latencies, 95),
      p99: percentile(latencies, 99),
      max: latencies.length > 0 ? latencies[latencies.length - 1] : 0
    },

    conversationLengthHistogram,

    topQuestions,
    topQuestionsIncludedConversations: topQuestionsIncluded,
    topQuestionsExcludedConversations:
      totalConversations - topQuestionsIncluded,

    perRegion: sortRegions(perRegion)
  }
}

export {
  DEFAULT_TOP_N,
  LONG_CONVERSATION_TURNS,
  REGION_TOP_QUESTIONS,
  UNKNOWN_COUNTRY,
  UNKNOWN_LANGUAGE
}
