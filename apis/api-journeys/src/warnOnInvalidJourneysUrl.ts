import type { Logger } from 'pino'

/**
 * Log one warning when JOURNEYS_URL is not an absolute `http(s)://` URL, and
 * carry on. The env schema only requires a non-empty string, but
 * `getJourneyPublicUrl` and `getJourneyEmbedUrl` build `${JOURNEYS_URL}/<slug>`
 * from it, so a relative or scheme-less value (a local `.env` typo) makes the
 * public campaign page's Share section throw on `new URL(embedUrl)`.
 */
export function warnOnInvalidJourneysUrl(
  journeysUrl: string | undefined,
  log: Pick<Logger, 'warn'>
): void {
  if (isAbsoluteHttpUrl(journeysUrl)) return
  log.warn(
    { module: 'env', JOURNEYS_URL: journeysUrl },
    'JOURNEYS_URL is not an absolute http(s):// URL; journey and embed links built from it will be broken'
  )
}

function isAbsoluteHttpUrl(value: string | undefined): boolean {
  if (value == null) return false
  try {
    const { protocol } = new URL(value)
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}
