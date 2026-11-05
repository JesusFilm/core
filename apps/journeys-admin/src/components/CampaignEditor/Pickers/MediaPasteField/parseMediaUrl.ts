import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

/** A pasted link the media paste field recognises, with what it resolves through. */
export type ParsedMediaUrl =
  | {
      source: VideoBlockSource.internal
      /** The address as pasted (trimmed): what the server re-resolves. */
      url: string
      /**
       * The variant slugs `<video>/<language>` the address may name, in the
       * order to try them through the gateway (see `watchSlugs`).
       */
      slugs: string[]
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

/** Watch's default language: an address without a language part names this variant. */
const WATCH_DEFAULT_LANGUAGE_SLUG = 'english'

/**
 * The variant slugs a Watch address may name, as the server reads them. After
 * `https://(www.)jesusfilm.org/watch/`, with `.html` on its outer parts, Watch
 * serves `<video>` (a video or container in the default language),
 * `<video>/<language>`, `<container>/<child>` (default language) and
 * `<container>/<child>/<language>`. The two-part shapes read the same, so
 * both readings are returned, video/language first. Null for anything else.
 */
function watchSlugs(url: URL): string[] | null {
  if (url.protocol !== 'https:' || !WATCH_HOSTS.includes(url.hostname))
    return null
  const [watch, ...rest] = pathSegments(url)
  if (watch !== 'watch' || rest.length < 1 || rest.length > 3) return null
  const outer = rest.length === 3 ? [rest[0], rest[2]] : rest
  if (!outer.every((segment) => HTML.test(segment))) return null
  if (rest.length === 3 && HTML.test(rest[1])) return null
  const parts = rest.map((segment) => segment.replace(HTML, ''))
  if (parts.some((segment) => segment === '')) return null
  if (parts.length === 1) return [`${parts[0]}/${WATCH_DEFAULT_LANGUAGE_SLUG}`]
  if (parts.length === 3) return [`${parts[1]}/${parts[2]}`]
  return [
    `${parts[0]}/${parts[1]}`,
    `${parts[1]}/${WATCH_DEFAULT_LANGUAGE_SLUG}`
  ]
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
 * (to its candidate variant slugs) or a YouTube link (to its video id). Null for
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
  const slugs = watchSlugs(url)
  if (slugs != null)
    return { source: VideoBlockSource.internal, url: trimmed, slugs }
  const videoId = youTubeId(url)
  if (videoId != null) return { source: VideoBlockSource.youTube, videoId }
  return null
}

/** A pasted YouTube playlist link: its first 12 videos become carousel items. */
export interface ParsedPlaylistUrl {
  source: 'youTubePlaylist'
  /** The address as pasted (trimmed): what the server re-resolves. */
  url: string
  playlistId: string
}

const PLAYLIST_ID = /^[\w-]{10,}$/

/**
 * The editor's pure shape check for a pasted playlist link,
 * `https://(www|m.)youtube.com/playlist?list=<id>`, as the server reads it.
 * A video link that also carries `list=` is a video, not a playlist.
 */
export function parsePlaylistUrl(value: string): ParsedPlaylistUrl | null {
  const trimmed = value.trim()
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (!YOUTUBE_HOSTS.includes(url.hostname)) return null
  if (url.pathname.replace(/\/$/, '') !== '/playlist') return null
  const playlistId = url.searchParams.get('list')
  if (playlistId == null || !PLAYLIST_ID.test(playlistId)) return null
  return { source: 'youTubePlaylist', url: trimmed, playlistId }
}
