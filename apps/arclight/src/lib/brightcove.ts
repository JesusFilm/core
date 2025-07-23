// lib/brightcove.ts

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
 * Gets a Brightcove video URL.
 *
 * @param brightcoveId - The video reference ID
 * @param type - 'hls', 'dl' (download low), 'dh' (download high)
 * @param bitrate - Target bitrate to match (optional for dl/dh types)
 * @param ip - Optional client IP
 * @returns The video URL
 */
export async function getBrightcoveUrl(
  brightcoveId: string,
  type: 'hls' | 'dl' | 'dh' | string,
  bitrate: number | null,
  ip?: string
): Promise<string> {
  if (!POLICY_KEY || !ACCOUNT_ID) {
    throw new Error('Brightcove environment variables not configured')
  }

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
      next: { revalidate: 3600 }
    }
  )

  if (!response.ok) {
    throw new Error(`Brightcove API error: ${response.status}`)
  }

  const video: BrightcoveVideo = await response.json()

  // Convert HTTP to HTTPS
  const sources = video.sources
    .filter((s) => s.src)
    .map((s) => ({ ...s, src: s.src.replace(/^http:/, 'https:') }))

  if (type === 'hls') {
    const hlsSource = sources.find((s) => s.type === 'application/x-mpegURL')
    if (!hlsSource) {
      throw new Error('No HLS source found')
    }
    return hlsSource.src
  }

  // Handle downloads with specific bitrate
  if ((type === 'dl' || type === 'dh') && bitrate != null && bitrate > 0) {
    const mp4Sources = sources
      .filter((s) => s.container === 'MP4' && s.avg_bitrate)
      .sort((a, b) => (a.avg_bitrate || 0) - (b.avg_bitrate || 0))

    if (mp4Sources.length === 0) {
      throw new Error('No MP4 sources found')
    }

    // Find first source with bitrate >= target, or highest if none found
    const match =
      mp4Sources.find((s) => (s.avg_bitrate || 0) >= bitrate) ||
      mp4Sources[mp4Sources.length - 1]

    return match.src
  }

  // Handle dl (low) and dh (high) without specific bitrate
  if (type === 'dl' || type === 'dh') {
    const { low, high } = findQualityRenditions(sources)

    if (type === 'dl' && low) {
      return low.src
    }

    if (type === 'dh' && high) {
      return high.src
    }

    throw new Error(`No ${type === 'dl' ? 'low' : 'high'} quality source found`)
  }

  throw new Error(`Unsupported type: ${type}`)
}
