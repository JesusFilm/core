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
// Downstream code (openrouter, facets, dataset) accepts only this type, so a
// raw Conversation cannot reach the OpenRouter call — the "samples are
// scrubbed before any LLM call" guarantee is compile-checked.
declare const sanitisedBrand: unique symbol
export type SanitisedConversation = Conversation & {
  readonly [sanitisedBrand]: true
}

// Theme labels + group assignments returned by the LLM. Never excerpt text —
// the explorer renders message text verbatim from the sanitised records; the
// model only contributes labels.
export interface Theme {
  label: string
  sessionIds: string[]
}

export interface ThemeSynthesis {
  themes: Theme[]
}

// ===========================================================================
// Insights explorer (NES-1719) — lossless dataset + shippable HTML viewer.
//
// The explorer keeps the corpus intact: every sanitised session with its full
// ordered message list, plus deterministic keyword facets and optional
// per-session LLM themes, serialised into a single offline HTML viewer that
// filters and drills in rather than reads a fixed report. The deliverable is
// the browsable data, not a summary.
// ===========================================================================

// One message in a session, in conversation order. `role` distinguishes the
// (sanitised) user turn from the assistant reply so the viewer can render a
// real back-and-forth a reader can follow start to finish.
export interface DatasetMessage {
  role: 'user' | 'assistant'
  text: string
  startTime: string
  model: string | null
}

// A facet the viewer can filter on. `kind` groups facets in the UI: LLM
// `theme`s, deterministic content `keyword`s, `country` (the trace's
// ipCountry — a region filter), and `language` (the journey's configured
// BCP-47 language). `count` is the number of sessions carrying the facet
// (document frequency), shown next to each chip.
export type FacetKind = 'theme' | 'keyword' | 'country' | 'language'

export interface Facet {
  key: string // stable filter key, e.g. 'keyword:resurrection' or 'theme:Suffering'
  label: string // human label, e.g. 'resurrection'
  kind: FacetKind
  count: number // sessions carrying this facet
}

// One session in the explorer dataset. `id` is the real (pseudonymous)
// Langfuse sessionId, kept for traceability; `label` is the short anonymous
// display name ('Session 001'). `facetKeys` lists the facets this session
// matches (drives filtering); `themes` are the per-session LLM labels.
export interface DatasetSession {
  id: string
  label: string
  synthetic: boolean
  language?: string
  ipCountry?: string
  journeyId?: string
  messageCount: number
  firstUserMessage: string
  startTime: string
  themes: string[]
  facetKeys: string[]
  messages: DatasetMessage[]
}

// Corpus-level counts shown in the viewer header so a reader can judge how
// trustworthy the grouping is (mirrors the v1 data-quality banner).
export interface DatasetSummary {
  windowFrom: string
  windowTo: string
  generatedAt: string
  totalSessions: number
  totalMessages: number
  nullSessionCount: number // sessions from traces with no sessionId
  singleTurnCount: number // sessions with exactly one turn
  excludedLoadTestTurns: number // turns dropped by the discriminator
  suppressedKeywordCount: number // over-common terms held back as facets
  themesAvailable: boolean // false when the LLM enrichment did not run
}

// The full bundle payload: the lossless session corpus + the curated facet
// vocabulary + summary. Serialised verbatim into the viewer and dataset.json.
export interface InsightsDataset {
  summary: DatasetSummary
  facets: Facet[]
  sessions: DatasetSession[]
}
