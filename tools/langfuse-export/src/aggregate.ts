// Deterministic report statistics. Pure: no IO, no LLM. Numbers here are the
// trustworthy half of the report — the LLM never produces figures.

import type {
  DateWindow,
  ReportStats,
  SanitisedConversation,
  TopQuestion
} from './types'

const DEFAULT_TOP_N = 20

function dayKey(iso: string): string {
  // YYYY-MM-DD from an ISO timestamp; '' if unparseable.
  return iso.length >= 10 ? iso.slice(0, 10) : ''
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

  for (const conversation of conversations) {
    const turnCount = conversation.turns.length
    totalTurns += turnCount
    if (conversation.synthetic) nullSessionCount += 1
    if (turnCount === 1) singleTurnCount += 1
    increment(conversationLengthHistogram, String(turnCount))

    const eligibleForQuestions = !conversation.synthetic && turnCount > 1
    if (eligibleForQuestions) topQuestionsIncluded += 1

    for (const turn of conversation.turns) {
      increment(perModel, turn.model ?? 'unknown')
      const day = dayKey(turn.startTime)
      increment(perDay, day)
      if (turn.costUsd != null) {
        totalCostUsd += turn.costUsd
        increment(costPerDayUsd, day, turn.costUsd)
      }
      if (turn.inputTokens != null) totalInputTokens += turn.inputTokens
      if (turn.outputTokens != null) totalOutputTokens += turn.outputTokens
      if (turn.latencySeconds != null) latencies.push(turn.latencySeconds)

      if (eligibleForQuestions && turn.userMessage.trim().length > 0) {
        const normalized = turn.userMessage.trim().toLowerCase()
        const existing = questionCounts.get(normalized)
        if (existing == null) {
          questionCounts.set(normalized, {
            message: turn.userMessage.trim(),
            count: 1
          })
        } else {
          existing.count += 1
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
    topQuestionsExcludedConversations: totalConversations - topQuestionsIncluded
  }
}

export { DEFAULT_TOP_N }
