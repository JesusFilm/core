import { env } from '../../env'

/** The error YouTube returns in the body instead of `items` (quota exceeded, bad key, not found). */
export interface YouTubeApiError {
  code: number
  message: string
}

/** A `videos` response with `part=snippet,contentDetails`. */
export interface YouTubeVideosData {
  error?: YouTubeApiError
  items?: Array<{
    id: string
    snippet: {
      title: string
      description: string
      thumbnails: { high: { url: string } }
    }
    contentDetails: {
      duration: string
    }
  }>
}

/** The Data API resources api-journeys reads. */
export type YouTubeResource = 'playlistItems' | 'videos'

/** The address of one Data API v3 request, carrying the API key. */
function youTubeUrl(
  resource: YouTubeResource,
  params: Record<string, string>
): string {
  const query = new URLSearchParams({
    ...params,
    key: env.FIREBASE_API_KEY
  }).toString()
  return `https://www.googleapis.com/youtube/v3/${resource}?${query}`
}

/** How long one Data API request may take before it is given up. */
const YOUTUBE_TIMEOUT_MS = 10_000

/**
 * One Data API request. The error YouTube reports in the body maps through
 * `toError`; so do a stalled or failed request (aborted after
 * `YOUTUBE_TIMEOUT_MS`), a non-OK status, and a body that is not JSON.
 */
export async function youTubeRequest<T extends { error?: YouTubeApiError }>(
  resource: YouTubeResource,
  params: Record<string, string>,
  toError: (error: YouTubeApiError) => Error
): Promise<T> {
  let response: Response
  try {
    response = await fetch(youTubeUrl(resource, params), {
      signal: AbortSignal.timeout(YOUTUBE_TIMEOUT_MS)
    })
  } catch (error) {
    throw toError({
      code: 0,
      message: error instanceof Error ? error.message : String(error)
    })
  }
  const body = (await response.json().catch(() => null)) as T | null
  if (body?.error != null) throw toError(body.error)
  if (!response.ok || body == null)
    throw toError({
      code: response.status,
      message: response.ok
        ? 'the response is not JSON'
        : `status ${response.status}`
    })
  return body
}
