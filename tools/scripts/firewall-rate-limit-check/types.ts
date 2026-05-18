/**
 * Shared types for the firewall-rate-limit-check scripts.
 *
 * These scripts are invoked by `.github/workflows/firewall-rate-limit-check.yml`
 * to verify that the Vercel Firewall rule on `/api/chat*` fires under load and
 * that legit traffic still survives. See `README.md` in this directory.
 */

export type TargetEnv = 'stage' | 'production'

export interface PreparedRun {
  host: string
  durationSeconds: number
}

/** A single probe/sentinel request's outcome. */
export interface RequestOutcome {
  /** HTTP status code, or `null` if the request errored before a response. */
  status: number | null
  /** Wall-clock duration of the request in seconds. `0` when errored. */
  timeSeconds: number
  /** Human-readable error message when the request failed. */
  error?: string
}

/** Tallied summary of all probe POSTs to /api/chat. */
export interface ProbeSummary {
  total: number
  count2xx: number
  count429: number
  /** Count of ALL 4xx responses, including 429 (matches the bash regex behaviour). */
  count4xxAll: number
  count5xx: number
  countError: number
  /** Map of status-code-string → count (e.g. `{ "200": 12, "429": 88, "ERR": 0 }`). */
  distribution: Record<string, number>
}

/** Summary of sentinel GETs to the public path. */
export interface SentinelSummary {
  total: number
  count2xx: number
  countError: number
  successPct: number
  p50Seconds: number
  p95Seconds: number
  distribution: Record<string, number>
}
