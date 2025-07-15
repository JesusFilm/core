interface CacheEntry {
  data: any
  expiresAt: number
}

export type BrightcoveSourceCode = 'hls' | 'dh' | 'dl'

const ACCOUNT_ID = process.env.BC_ACCOUNT_ID
const POLICY_KEY = process.env.BC_POLICY_KEY
const CACHE_TTL_MS = 300000
const CACHE_MAX_ENTRIES = 5000

if (!ACCOUNT_ID) {
  console.warn(
    'Brightcove ACCOUNT_ID is not configured. Set BC_ACCOUNT_ID or BRIGHTCOVE_ACCOUNT_ID in environment.'
  )
}

const cache = new Map<string, CacheEntry>()

function setCache(key: string, data: BrightcoveVideo) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const firstKey = cache.keys().next().value
    if (firstKey) cache.delete(firstKey)
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

function getCache(key: string): BrightcoveVideo | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return undefined
  }
  return entry.data
}

export interface BrightcoveVideo {
  sources?: Array<{
    type?: string
    container?: string
    avg_bitrate?: number
    src?: string
  }>
  // Add more fields as needed from the Brightcove API response
}

export async function getBrightcoveVideo(
  ovpReferenceId: string,
  forceRefresh = false,
  ip?: string
): Promise<BrightcoveVideo | undefined> {
  if (!ACCOUNT_ID) {
    throw new Error('Brightcove ACCOUNT_ID not configured')
  }
  if (!forceRefresh) {
    const cached = getCache(ovpReferenceId)
    if (cached) {
      return cached
    }
  }

  if (!POLICY_KEY) {
    throw new Error('Brightcove POLICY_KEY not configured')
  }

  const apiHeaders: HeadersInit = {
    Authorization: `BCOV-Policy ${POLICY_KEY}`,
    'X-Forwarded-For': ip ?? '' // This is required for the Brightcove Playback API
  }
  const response = await fetch(
    `https://edge.api.brightcove.com/playback/v1/accounts/${ACCOUNT_ID}/videos/ref:${encodeURIComponent(
      ovpReferenceId
    )}`,
    {
      headers: apiHeaders
    }
  )

  if (response.ok) {
    const json = await response.json()
    if (!forceRefresh) {
      setCache(ovpReferenceId, json)
    }
    return json
  }

  if (response.status === 401 || response.status === 403) {
    console.warn('[Brightcove] unauthorized for key', POLICY_KEY)
  }
  if (response.status !== 401 && response.status !== 403) {
    throw new Error(`Brightcove Playback API responded with ${response.status}`)
  }
}

export function selectBrightcoveSource(
  video: BrightcoveVideo,
  code: BrightcoveSourceCode
): string | null {
  if (!video?.sources || !Array.isArray(video.sources)) return null
  const sources = video.sources

  switch (code) {
    case 'hls': {
      const src = sources.find((s) => s.type === 'application/x-mpegURL')
      return src?.src ?? null
    }
    case 'dh': {
      const mp4s = sources.filter((s) => s.container === 'MP4')
      if (!mp4s.length) return null
      const sorted = mp4s.sort(
        (a, b) => (b.avg_bitrate ?? 0) - (a.avg_bitrate ?? 0)
      )
      return sorted[0]?.src ?? null
    }
    case 'dl': {
      const mp4s = sources.filter((s) => s.container === 'MP4')
      if (!mp4s.length) return null
      const sorted = mp4s.sort(
        (a, b) => (a.avg_bitrate ?? 0) - (b.avg_bitrate ?? 0)
      )
      return sorted[0]?.src ?? null
    }
    default:
      return null
  }
}

/**
 * Returns the correct Brightcove redirect URL for a given ID and type.
 * @param brightcoveId The Brightcove video reference ID
 * @param redirectType One of 'hls', 'dh', 'dl', or 's' (share)
 * @param clientIp Optional client IP for Brightcove API
 * @returns The redirect URL as a string
 * @throws Error if the video or source is not found
 */
export async function getBrightcoveRedirectUrl(
  brightcoveId: string,
  redirectType: BrightcoveSourceCode,
  clientIp?: string
): Promise<string> {
  const video = await getBrightcoveVideo(brightcoveId, false, clientIp)
  if (!video) throw new Error('Brightcove video not found')

  const src = selectBrightcoveSource(video, redirectType)
  if (!src) {
    throw new Error(`No source found for type: ${redirectType}`)
  }
  return src
}
