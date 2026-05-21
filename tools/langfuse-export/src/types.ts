// Shared record + report types for the Langfuse trace-export tool (NES-1690).

export interface DateWindow {
  from: Date
  to: Date
}

// One Langfuse trace (a single chat turn's parent span). Carries the
// fields the CSV observations export drops: sessionId, metadata, tags.
export interface TraceRecord {
  id: string
  sessionId: string | null
  timestamp: string
  // Deployment environment the trace was tagged with (NES-1688:
  // production | stage | preview | development). `null` when the trace
  // predates env tagging — Langfuse buckets those under "default".
  environment: string | null
  metadata: Record<string, unknown>
  tags: string[]
  ipCountry?: string
  journeyId?: string
  language?: string
}

// One Langfuse observation (a GENERATION). Carries the message payload
// + per-turn model/usage/cost/latency. `inputRaw`/`outputRaw` are kept
// untyped because the live shape must be confirmed against a real fetch
// (see plan Open Questions) — normalize.ts extracts text tolerantly.
export interface ObservationRecord {
  id: string
  traceId: string
  type: string
  model: string | null
  startTime: string
  endTime: string | null
  latencySeconds: number | null
  inputRaw: unknown
  outputRaw: unknown
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  costUsd: number | null
}

export interface ConversationTurn {
  observationId: string
  traceId: string
  startTime: string
  userMessage: string
  assistantReply: string
  model: string | null
  latencySeconds: number | null
  inputTokens: number | null
  outputTokens: number | null
  totalTokens: number | null
  costUsd: number | null
}

export interface Conversation {
  // Real Langfuse sessionId, or a synthetic per-trace id when the trace
  // carried no sessionId (synthetic === true).
  sessionId: string
  synthetic: boolean
  ipCountry?: string
  journeyId?: string
  language?: string
  tags: string[]
  turns: ConversationTurn[]
}

// Branded type: only sanitize.ts can construct a SanitisedConversation.
// Downstream code (aggregate, openrouter, report) accepts only this type,
// so a raw Conversation cannot reach the OpenRouter call — the
// "samples are scrubbed before any LLM call" guarantee is compile-checked.
declare const sanitisedBrand: unique symbol
export type SanitisedConversation = Conversation & {
  readonly [sanitisedBrand]: true
}

export interface CountShare {
  count: number
  share: number // 0..1 of the relevant denominator
}

export interface TopQuestion {
  message: string
  count: number
}

export interface ReportStats {
  windowFrom: string
  windowTo: string
  generatedAt: string

  totalConversations: number
  totalTurns: number

  // Grouping fidelity — surfaces how trustworthy the conversation grouping is.
  nullSession: CountShare // conversations from traces with no sessionId
  singleTurn: CountShare // conversations with exactly one turn
  excludedLoadTest: { count: number } // turns dropped by the discriminator

  perModel: Record<string, number>
  perDay: Record<string, number>

  totalCostUsd: number
  costPerDayUsd: Record<string, number>
  totalInputTokens: number
  totalOutputTokens: number

  latencySeconds: {
    count: number
    p50: number
    p95: number
    p99: number
    max: number
  }

  conversationLengthHistogram: Record<string, number> // turns -> conversation count

  // Computed only over real-session, length>1 conversations.
  topQuestions: TopQuestion[]
  topQuestionsIncludedConversations: number
  topQuestionsExcludedConversations: number
}

// Theme labels + group assignments returned by the LLM. Never excerpt text —
// report.ts renders excerpt text verbatim from the sanitised records.
export interface Theme {
  label: string
  sessionIds: string[]
}

export interface ThemeSynthesis {
  themes: Theme[]
}
