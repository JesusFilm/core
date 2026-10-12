import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

/** A pasted link the media paste field recognises, with what it resolves through. */
export type ParsedMediaUrl =
  | {
      source: VideoBlockSource.internal
      /** The address as pasted (trimmed): what the server re-resolves. */
      url: string
      /** The variant slug `<video>/<language>` the gateway resolves. */
      slug: string
    }
  | { source: VideoBlockSource.youTube; videoId: string }

const WATCH_HOSTS = ['jesusfilm.org', 'www.jesusfilm.org']
const YOUTUBE_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com'
]
const YOUTUBE_ID = /^[0-9A-Za-z_-]{11}$/
const HTML = /\.html$/

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function pathSegments(url: URL): string[] {
  return url.pathname
    .split('/')
    .filter((segment) => segment !== '')
    .map(decodeSegment)
}

/**
 * A Watch address is `https://(www.)jesusfilm.org/watch/<video>.html/<language>.html`
 * or, with its container in front,
 * `/watch/<container>.html/<video>/<language>.html`. The variant slug is the
 * last two segments with `.html` stripped, as the server reads it.
 */
function watchSlug(url: URL): string | null {
  if (url.protocol !== 'https:' || !WATCH_HOSTS.includes(url.hostname))
    return null
  const [watch, ...rest] = pathSegments(url)
  if (watch !== 'watch') return null
  const shaped =
    (rest.length === 2 && rest.every((segment) => HTML.test(segment))) ||
    (rest.length === 3 &&
      HTML.test(rest[0]) &&
      !HTML.test(rest[1]) &&
      HTML.test(rest[2]))
  if (!shaped) return null
  const slug = rest.slice(-2).map((segment) => segment.replace(HTML, ''))
  if (slug.some((segment) => segment === '')) return null
  return slug.join('/')
}

/** The 11-character id of a `watch?v=`, `youtu.be/`, `shorts/` or `embed/` link. */
function youTubeId(url: URL): string | null {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const segments = pathSegments(url)
  let id: string | null | undefined
  if (url.hostname === 'youtu.be') id = segments[0]
  else if (YOUTUBE_HOSTS.includes(url.hostname)) {
    if (segments[0] === 'watch' && segments.length === 1)
      id = url.searchParams.get('v')
    else if (
      (segments[0] === 'shorts' || segments[0] === 'embed') &&
      segments.length === 2
    )
      id = segments[1]
  }
  return id != null && YOUTUBE_ID.test(id) ? id : null
}

/**
 * The editor's pure shape check for a pasted video link: a Watch address
 * (to its variant slug) or a YouTube link (to its video id). Null for
 * anything else; the server re-checks a Watch address when it is kept.
 */
export function parseMediaUrl(value: string): ParsedMediaUrl | null {
  const trimmed = value.trim()
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  const slug = watchSlug(url)
  if (slug != null)
    return { source: VideoBlockSource.internal, url: trimmed, slug }
  const videoId = youTubeId(url)
  if (videoId != null) return { source: VideoBlockSource.youTube, videoId }
  return null
}
