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

// A machine translation of one source string (NES-1762). `sourceLanguage` is
// what the model detected; `english` is present only when the source was NOT
// English. Detection and translation come from the same pass, so a record with
// sourceLanguage 'en' and no `english` means "read as-is, nothing translated".
export interface Translation {
  sourceLanguage: string // BCP-47-ish code the model detected, e.g. 'bn', 'es'
  english?: string // omitted when sourceLanguage === 'en'
}

// Right-to-left scripts present in the corpus (Arabic, Hebrew, Farsi, Urdu).
// The viewer sets dir="auto" on original text so RTL renders correctly while
// the English translation stays LTR.
export const RTL_LANGUAGES: readonly string[] = [
  'ar',
  'fa',
  'he',
  'ur',
  'ps',
  'sd',
  'yi'
]

// One message in a session, in conversation order. `role` distinguishes the
// (sanitised) user turn from the assistant reply so the viewer can render a
// real back-and-forth a reader can follow start to finish.
//
// `text` is ALWAYS the original, byte-for-byte — translation is additive and
// never overwrites the source of truth. `textEnglish` is present only when the
// message was detected as non-English and translated.
export interface DatasetMessage {
  role: 'user' | 'assistant'
  text: string
  textEnglish?: string
  sourceLanguage?: string
  startTime: string
  model: string | null
}

// A facet the viewer can filter on. `kind` groups facets in the UI: LLM
// `theme`s, deterministic content `keyword`s, `country` (the trace's
// ipCountry — a region filter), and `language` (the journey's configured
// BCP-47 language). `count` is the number of sessions carrying the facet
// (document frequency), shown next to each chip.
// `language` is the journey's CONFIGURED language; `typedLanguage` is what the
// user actually wrote. They disagree often enough to mislead: 6 sessions on a
// 'Bengali' journey contain no Bengali at all, and Yiddish/Korean/Hindi were
// typed but had no journey of their own. Both are facets so the distinction is
// structural rather than a footnote.
export type FacetKind =
  | 'theme'
  | 'keyword'
  | 'country'
  | 'language'
  | 'typedLanguage'

export interface Facet {
  key: string // stable filter key, e.g. 'keyword:resurrection' or 'theme:Suffering'
  label: string // human label, e.g. 'resurrection'
  kind: FacetKind
  count: number // sessions carrying this facet
  // Keyword facets are tokenised from raw user messages, so they inherit the
  // source language. When a keyword is non-English these carry its English
  // gloss; `label` still holds the original term the filter key is built from.
  labelEnglish?: string
  sourceLanguage?: string
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
  // The journey's raw configured language, exactly as the chat client sent it
  // ('es', or 'Spanish, Latin American'). `languageLabel` is the normalised
  // display name the facet rail filters on.
  languageLabel?: string
  // Distinct non-English languages actually detected in this session's messages,
  // most frequent first. A session can carry several — and its journey language
  // frequently disagrees with what the user typed.
  translatedLanguages: string[]
  messageCount: number
  firstUserMessage: string
  firstUserMessageEnglish?: string
  // Detected language of `firstUserMessage`; also drives the session-card
  // "translated" affordance. Distinct from `language`, which is the journey's
  // configured language and may not match what the user actually typed.
  sourceLanguage?: string
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
  translationAvailable: boolean // false when the translation pass did not run
  translatedMessageCount: number // messages carrying an English translation
  // Keyword facets dropped because their English gloss is a stopword — the
  // non-English function words the English-only stopword list never caught.
  suppressedTranslatedKeywordCount: number
  // Distinct non-English source languages found in the corpus, most frequent
  // first. Drives the header disclosure ("machine-translated from N languages").
  sourceLanguages: string[]
}

// The full bundle payload: the lossless session corpus + the curated facet
// vocabulary + summary. Serialised verbatim into the viewer and dataset.json.
export interface InsightsDataset {
  summary: DatasetSummary
  facets: Facet[]
  sessions: DatasetSession[]
}
