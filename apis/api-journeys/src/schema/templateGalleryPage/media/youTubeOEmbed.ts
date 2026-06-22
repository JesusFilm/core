import { GraphQLError } from 'graphql'

import { EmbedNormalizerSpec } from './types'

// Public oEmbed validation endpoint — no API key.
const YOUTUBE_OEMBED_ENDPOINT = 'https://www.youtube.com/oembed'
const FETCH_TIMEOUT_MS = 5000

// YouTube video IDs are exactly 11 characters from the URL-safe alphabet.
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/

function badYouTubeUrl(): GraphQLError {
  return new GraphQLError('Could not find a YouTube video ID in this URL.', {
    extensions: { code: 'BAD_USER_INPUT', reason: 'YOUTUBE_INVALID_URL' }
  })
}

/**
 * Extracts the 11-char video ID from any of the supported paste shapes:
 * `watch?v=`, `youtu.be/`, `shorts/`, `embed/`, `live/`, and the `m.` mobile
 * host. Query fragments such as `?t=30` are ignored. Returns `null` when no
 * valid ID is present.
 */
function extractVideoId(parsed: URL): string | null {
  const host = parsed.hostname.toLowerCase().replace(/^(?:www|m)\./, '')

  let candidate: string | null = null
  if (host === 'youtu.be') {
    candidate = parsed.pathname.split('/')[1] ?? null
  } else if (parsed.pathname === '/watch') {
    candidate = parsed.searchParams.get('v')
  } else {
    candidate =
      /^\/(?:shorts|embed|live)\/([^/]+)/.exec(parsed.pathname)?.[1] ?? null
  }

  if (candidate == null || !VIDEO_ID.test(candidate)) return null
  return candidate
}

async function normalize(url: string): Promise<{ embedUrl: string }> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw badYouTubeUrl()
  }

  const videoId = extractVideoId(parsed)
  if (videoId == null) throw badYouTubeUrl()

  const oembedUrl = `${YOUTUBE_OEMBED_ENDPOINT}?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${videoId}`
  )}&format=json`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let response: Response
  try {
    response = await fetch(oembedUrl, { signal: controller.signal })
  } catch {
    throw new GraphQLError('YouTube validation request failed', {
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  } finally {
    clearTimeout(timeout)
  }

  if (response.ok) {
    // Privacy-enhanced embed host — does not set cookies until playback.
    return { embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}` }
  }
  if (response.status === 401) {
    throw new GraphQLError('This YouTube video is private.', {
      extensions: { code: 'BAD_USER_INPUT', reason: 'YOUTUBE_PRIVATE' }
    })
  }
  if (response.status === 404) {
    throw new GraphQLError(
      'This YouTube video is unavailable or has embedding disabled.',
      { extensions: { code: 'BAD_USER_INPUT', reason: 'YOUTUBE_UNAVAILABLE' } }
    )
  }
  throw new GraphQLError('YouTube validation request failed', {
    extensions: { code: 'INTERNAL_SERVER_ERROR' }
  })
}

export const youTubeSpec: EmbedNormalizerSpec = {
  hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'],
  normalize
}
