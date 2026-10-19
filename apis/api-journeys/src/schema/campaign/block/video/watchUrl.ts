import { fetchWatchVideoBySlug } from '../../gatewayClient'
import { badUserInput } from '../../validation'

export const WATCH_URL_ERROR = "That link isn't a Watch video"

/** Watch's default language: an address without a language part names this variant. */
export const WATCH_DEFAULT_LANGUAGE_SLUG = 'english'

/**
 * The variant slugs (`<videoSlug>/<languageSlug>`) a Watch address may name,
 * in the order to try them. After `/watch/`, with `.html` on its outer parts,
 * Watch serves:
 *
 * - `<video>` — a video or container in the default language
 * - `<video>/<language>` — a video in a language
 * - `<container>/<child>` — a child inside its container, default language
 * - `<container>/<child>/<language>` — that child in a language
 *
 * The two-part shapes read the same, so both readings are returned: as
 * video/language first, then as container/child. Empty for anything else.
 */
export function watchSlugCandidates(url: string): string[] {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return []
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return []
  const segments = parsed.pathname
    .split('/')
    .filter((segment) => segment !== '')
    .map((segment) => decodeURIComponent(segment).replace(/\.html$/, ''))
  const watch = segments.indexOf('watch')
  if (watch === -1) return []
  const rest = segments.slice(watch + 1)
  if (rest.some((segment) => segment === '')) return []
  switch (rest.length) {
    case 1:
      return [`${rest[0]}/${WATCH_DEFAULT_LANGUAGE_SLUG}`]
    case 2:
      return [
        `${rest[0]}/${rest[1]}`,
        `${rest[1]}/${WATCH_DEFAULT_LANGUAGE_SLUG}`
      ]
    case 3:
      return [`${rest[1]}/${rest[2]}`]
    default:
      return []
  }
}

/**
 * Resolve a pasted Watch URL to a Video id: the shape first, then each
 * candidate variant slug through the gateway `video(id, idType: slug)` until
 * one resolves. None resolving is `BAD_USER_INPUT` / `url`.
 */
export async function resolveWatchUrl(url: string): Promise<string> {
  const candidates = watchSlugCandidates(url)
  if (candidates.length === 0) throw badUserInput(WATCH_URL_ERROR, 'url')
  for (const slug of candidates) {
    const video = await fetchWatchVideoBySlug(slug)
    if (video != null) return video.id
  }
  throw badUserInput(WATCH_URL_ERROR, 'url')
}
