import type { Logger } from 'pino'

/**
 * Log one warning when JOURNEYS_URL is not an absolute `http(s)://` URL, and
 * carry on. The env schema only requires a non-empty string (see `env.ts`),
 * but journey and embed links are built as `${JOURNEYS_URL}/<slug>`, so a
 * relative or scheme-less value (a local `.env` typo) breaks them.
 */
export function warnOnInvalidJourneysUrl(
  journeysUrl: string,
  log: Pick<Logger, 'warn'>
): void {
  if (isAbsoluteHttpUrl(journeysUrl)) return
  log.warn(
    { module: 'env', JOURNEYS_URL: journeysUrl },
    'JOURNEYS_URL is not an absolute http(s):// URL; journey and embed links built from it will be broken'
  )
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
