/**
 * Fully decodes a URI component that may have been double-encoded
 * (e.g. %252F → %2F → /). Decodes repeatedly until the value is stable,
 * preventing the recursive URL-encoding bug in the redirect pipeline.
 */
export function safeDecodeRedirect(value: string): string {
  let decoded = value
  try {
    let previous = ''
    while (decoded !== previous) {
      previous = decoded
      decoded = decodeURIComponent(decoded)
    }
  } catch {
    // malformed URI sequence, return last successful decode
  }
  return decoded
}
