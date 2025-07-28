// lib/brightcove.ts

import { generateCacheKey, getWithStrictCache } from './cache'

interface BrightcoveSource {
  src: string
  type: string
  container?: string
  avg_bitrate?: number
}

interface BrightcoveVideo {
  sources: BrightcoveSource[]
}

const POLICY_KEY = process.env.BC_POLICY_KEY
const ACCOUNT_ID = process.env.BC_ACCOUNT_ID

/**
 * Finds low and high quality renditions from available sources
 */
function findQualityRenditions(sources: BrightcoveSource[]): {
  low: BrightcoveSource | null
  high: BrightcoveSource | null
} {
  // Filter MP4s with valid bitrates
  const mp4Sources = sources
    .filter((s) => s.container === 'MP4' && s.avg_bitrate && s.avg_bitrate > 0)
    .sort((a, b) => (a.avg_bitrate || 0) - (b.avg_bitrate || 0))

  if (mp4Sources.length === 0) {
    return { low: null, high: null }
  }

  return {
    low: mp4Sources[0], // Lowest bitrate
    high: mp4Sources[mp4Sources.length - 1] // Highest bitrate
  }
}

/**
 * Finds the closest bitrate match from available sources
 */
function findClosestBitrate(
  sources: BrightcoveSource[],
  targetBitrate: number
): BrightcoveSource {
  // Filter sources with valid bitrates
  const validSources = sources.filter((s) => s.avg_bitrate && s.avg_bitrate > 0)

  if (validSources.length === 0) {
    throw new Error('No sources with valid bitrates available')
  }

  // Find the source with the closest bitrate to target
  let closest = validSources[0]
  let minDifference = Math.abs(closest.avg_bitrate! - targetBitrate)

  for (const source of validSources) {
    const difference = Math.abs(source.avg_bitrate! - targetBitrate)
    if (difference < minDifference) {
      minDifference = difference
      closest = source
    }
  }

  return closest
}

/**
 * Gets a Brightcove video URL.
 *
 * @param brightcoveId - The video reference ID
 * @param type - 'hls', 'dl' (download low), 'dh' (download high)
 * @param bitrate - Target bitrate to match (optional for dl/dh types)
 * @param ip - Optional client IP
 * @param ttlSeconds - Optional cache TTL in seconds (default 30)
 * @returns The video URL
 */
export async function getBrightcoveUrl(
  brightcoveId: string,
  type: 'hls' | 'dl' | 'dh' | string,
  bitrate: number | null,
  ip?: string,
  ttlSeconds: number = 30
): Promise<string> {
  if (!POLICY_KEY || !ACCOUNT_ID) {
    throw new Error('Brightcove environment variables not configured')
  }

  const cacheKey = generateCacheKey([
    'bc-url',
    ACCOUNT_ID,
    brightcoveId,
    type,
    bitrate || ''
  ])

  return getWithStrictCache(
    cacheKey,
    async () => {
      const headers: HeadersInit = {
        Authorization: `BCOV-Policy ${POLICY_KEY}`
      }
      if (ip) {
        headers['X-Forwarded-For'] = ip
      }
      const response = await fetch(
        `https://edge.api.brightcove.com/playback/v1/accounts/${ACCOUNT_ID}/videos/ref:${encodeURIComponent(brightcoveId)}`,
        {
          headers,
          cache: 'no-store'
        }
      )
      if (!response.ok) {
        throw new Error(`Brightcove API error: ${response.status}`)
      }
      const video: BrightcoveVideo = await response.json()
      const sources = video.sources
        .filter((s) => s.src)
        .map((s) => ({ ...s, src: s.src.replace(/^http:/, 'https:') }))
      let url: string
      if (type === 'hls') {
        const hlsSource = sources.find(
          (s) => s.type === 'application/x-mpegURL'
        )
        if (!hlsSource) {
          throw new Error('No HLS source found')
        }
        url = hlsSource.src
      } else if (
        (type === 'dl' || type === 'dh') &&
        bitrate != null &&
        bitrate > 0
      ) {
        const mp4Sources = sources
          .filter((s) => s.container === 'MP4' && s.avg_bitrate)
          .sort((a, b) => (a.avg_bitrate || 0) - (b.avg_bitrate || 0))
        if (mp4Sources.length === 0) {
          throw new Error('No MP4 sources found')
        }
        const match = findClosestBitrate(mp4Sources, bitrate)
        url = match.src
      } else if (type === 'dl' || type === 'dh') {
        const { low, high } = findQualityRenditions(sources)
        if (type === 'dl' && low) {
          url = low.src
        } else if (type === 'dh' && high) {
          url = high.src
        } else {
          throw new Error(
            `No ${type === 'dl' ? 'low' : 'high'} quality source found`
          )
        }
      } else {
        throw new Error(`Unsupported type: ${type}`)
      }
      return url
    },
    ttlSeconds
  )
}
