import { resolveHttpSize } from './httpSize'
import type { HttpSizeClient, ResolveSizeResult } from './types'

/**
 * Legacy URLs have no linked provider record — verify the final URL's
 * Content-Length, falling back to a one-byte Range request.
 */
export async function resolveLegacySize(
  url: string,
  httpClient: HttpSizeClient
): Promise<ResolveSizeResult> {
  return resolveHttpSize(url, httpClient)
}
