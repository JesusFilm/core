/**
 * Whether a URL is an absolute https web address. Only these render as links
 * or images: the API enforces it on write, and repeating it at render keeps a
 * `javascript:`, `data:` or `http:` URL out of `href` and `src` whatever wrote
 * the data.
 */
export function isHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:'
  } catch {
    return false
  }
}
