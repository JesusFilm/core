/** A pasted address as a URL, or null when it is not an absolute URL. */
export function parseUrl(value: string): URL | null {
  try {
    return new URL(value.trim())
  } catch {
    return null
  }
}
