import { fetchWatchVideoBySlug } from '../../gatewayClient'
import { badUserInput } from '../../validation'

export const WATCH_URL_ERROR = "That link isn't a Watch video"

/**
 * A Watch address is `/watch/<videoSlug>.html/<languageSlug>.html`, or with
 * its container in front, `/watch/<container>.html/<videoSlug>/<languageSlug>.html`.
 * Strip the `.html` parts and keep the last two segments: the variant slug
 * `<videoSlug>/<languageSlug>`. `null` for anything else.
 */
export function parseWatchUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  const segments = parsed.pathname
    .split('/')
    .filter((segment) => segment !== '')
    .map((segment) => decodeURIComponent(segment).replace(/\.html$/, ''))
  const watch = segments.indexOf('watch')
  if (watch === -1) return null
  const rest = segments.slice(watch + 1)
  if (rest.length < 2) return null
  return rest.slice(-2).join('/')
}

/**
 * Resolve a pasted Watch URL to a Video id: the shape first, then the gateway
 * `video(id, idType: slug)`. Either failing is `BAD_USER_INPUT` / `url`.
 */
export async function resolveWatchUrl(url: string): Promise<string> {
  const slug = parseWatchUrl(url)
  if (slug == null) throw badUserInput(WATCH_URL_ERROR, 'url')
  const video = await fetchWatchVideoBySlug(slug)
  if (video == null) throw badUserInput(WATCH_URL_ERROR, 'url')
  return video.id
}
