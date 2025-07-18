// lib/brightcove.ts

// --- Interfaces and Types ---

export interface BrightcoveSource {
  src: string
  type: string
  container?: 'MP4'
  height?: number
  width?: number
  avg_bitrate?: number
}

export interface BrightcoveVideo {
  id: string
  name: string
  description: string
  duration: number
  custom_fields: {
    mediacomponentid?: string
    languageid?: string
    // Add other custom fields here
  }
  sources: BrightcoveSource[]
  // Add other properties like poster, thumbnail, etc.
}

/**
 * Canonical rendition types. This is the standard we will use across the app.
 */
export type RenditionType =
  | 'hls'
  | 'download-low'
  | 'download-sd'
  | 'download-high'

/**
 * Short codes used in the database.
 */
export type BrightcoveSourceCode = 'hls' | 'dl' | 'dh' | 'dsd'

// --- Environment Configuration ---

// Ensure these are loaded from environment variables and not hardcoded.
const POLICY_KEY = process.env.BC_POLICY_KEY
const ACCOUNT_ID = process.env.BC_ACCOUNT_ID

// --- Core Fetch Function ---

/**
 * Fetches a Brightcove video by its reference ID.
 * This function is designed to run on the server (Server Component, Route Handler, etc.).
 * It uses Next.js's built-in fetch caching.
 *
 * @param ovpReferenceId The video's reference ID.
 * @param ip Optional IP address for geo-restriction checks.
 * @returns A Promise resolving to the BrightcoveVideo object or undefined if not found.
 */
export async function getBrightcoveVideo(
  ovpReferenceId: string,
  ip?: string
): Promise<BrightcoveVideo | undefined> {
  console.log('--------------------------------')
  console.log('IN getBrightcoveVideo')
  if (!POLICY_KEY || !ACCOUNT_ID) {
    console.log('--------------------------------')
    console.log('POLICY_KEY', POLICY_KEY)
    console.log('ACCOUNT_ID', ACCOUNT_ID)
    console.log('--------------------------------')
    throw new Error('Brightcove environment variables are not configured.')
  }

  const apiHeaders: HeadersInit = {
    // The BCOV-Policy token is the only required header for auth.
    Authorization: `BCOV-Policy ${POLICY_KEY}`
  }

  // The X-Forwarded-For header is used for geo-restricted content.
  if (ip) {
    apiHeaders['X-Forwarded-For'] = ip
  }

  try {
    const response = await fetch(
      `https://edge.api.brightcove.com/playback/v1/accounts/${ACCOUNT_ID}/videos/ref:${encodeURIComponent(
        ovpReferenceId
      )}`,
      {
        headers: apiHeaders,
        // Leverage Next.js's built-in caching.
        // Revalidate the data every hour (3600 seconds). Adjust as needed.
        next: { revalidate: 3600 }
      }
    )

    if (response.ok) {
      console.log('RESPONSE OK')
      const json: BrightcoveVideo = await response.json()
      console.log('--------------------------------')
      return json
    }

    // Handle specific client errors like not found
    if (response.status === 404) {
      console.log('--------------------------------')
      console.warn(`[Brightcove] Video not found for ref: ${ovpReferenceId}`)
      return undefined
    }

    // Handle auth errors
    if (response.status === 401 || response.status === 403) {
      console.log('--------------------------------')
      console.error('[Brightcove] Unauthorized. Check your POLICY_KEY.')
      // In production, you might not want to throw here, but log the error.
    }

    // For other server-side errors, throw an error to be caught by an error boundary.
    if (response.status >= 500) {
      console.log('--------------------------------')
      throw new Error(
        `Brightcove Playback API responded with server error ${response.status}`
      )
    }
  } catch (error) {
    console.log('--------------------------------')
    console.error('[Brightcove] Failed to fetch video:', error)
    console.log('--------------------------------')
  }
  console.log('--------------------------------')
  console.log('OUT getBrightcoveVideo')
  console.log('--------------------------------')
  return undefined
}

// --- The Unified Selection Logic ---

/**
 * Maps the database short codes to our canonical RenditionType.
 * This is the bridge between your keyword route and the unified logic.
 */
export function mapCodeToRenditionType(
  code: BrightcoveSourceCode
): RenditionType {
  switch (code) {
    case 'hls':
      return 'hls'
    case 'dl':
      return 'download-low'
    case 'dsd':
      return 'download-sd'
    case 'dh':
      return 'download-high'
  }
}

/**
 * The single, authoritative function for selecting a video rendition.
 * This replaces all other selection logic.
 *
 * @param video The full BrightcoveVideo object.
 * @param type The desired canonical rendition type.
 * @returns The source URL (src) of the best matching rendition.
 * @throws An error if a suitable rendition cannot be found.
 */
export function selectBrightcoveRendition(
  video: BrightcoveVideo,
  type: RenditionType
): string {
  let returnUrl = ''

  console.log('--------------------------------')
  console.log('IN selectBrightcoveRendition')
  // Always prefer HTTPS sources for security and to avoid mixed-content issues.
  const sources = video.sources.filter((s) => s.src.startsWith('https'))

  if (type === 'hls') {
    const hlsSource = sources.find((s) => s.type === 'application/x-mpegURL')
    console.log('hlsSource', hlsSource)
    if (!hlsSource) throw new Error('HLS source not found in video sources.')
    returnUrl = hlsSource.src
  }

  // For all download types, we need MP4 renditions with height data.
  const mp4s = sources.filter(
    (s): s is BrightcoveSource & { src: string; height: number } =>
      s.container === 'MP4' && s.height != null
  )
  console.log('mp4s', mp4s)
  if (mp4s.length === 0) {
    console.log('--------------------------------')
    console.log('No downloadable MP4 sources found.')
    console.log('--------------------------------')
    throw new Error('No downloadable MP4 sources found.')
  }

  console.log('--------------------------------')
  console.log('mp4s', mp4s)
  console.log('--------------------------------')
  // Sort renditions by height (lowest to highest)
  mp4s.sort((a, b) => a.height - b.height)
  console.log('--------------------------------')
  console.log('sorted mp4s', mp4s)
  console.log('--------------------------------')
  switch (type) {
    case 'download-low':
      // The first element is the lowest resolution
      returnUrl = mp4s[0].src
      break
    case 'download-high':
      // The last element is the highest resolution
      returnUrl = mp4s[mp4s.length - 1].src
      break
    case 'download-sd': {
      // **This is the logic for Standard Definition (SD)**
      // We find the rendition closest to 480p.
      const targetHeight = 480
      const closest = mp4s.reduce((prev, curr) => {
        const prevDiff = Math.abs(prev.height - targetHeight)
        const currDiff = Math.abs(curr.height - targetHeight)
        return currDiff < prevDiff ? curr : prev
      })
      console.log('closest', closest)
      returnUrl = closest.src
      break
    }
  }

  return returnUrl
}

// --- Legacy Compatibility Functions ---

/**
 * Legacy function for backward compatibility with existing routes.
 * Maps the short code to rendition type and uses the unified selection logic.
 */
export async function getBrightcoveRedirectUrl(
  brightcoveId: string,
  code: BrightcoveSourceCode,
  clientIp?: string
): Promise<string> {
  console.log('--------------------------------')
  console.log('brightcoveId', brightcoveId)
  console.log('code', code)
  console.log('clientIp', clientIp)
  console.log('--------------------------------')
  const video = await getBrightcoveVideo(brightcoveId, clientIp)
  if (!video) {
    throw new Error('Brightcove video not found.')
  }

  // const renditionType = mapCodeToRenditionType(code)
  const renditionType = 'download-high'
  console.log('renditionType', renditionType)
  const url = selectBrightcoveRendition(video, renditionType)
  console.log('--------------------------------')
  console.log('url', url)
  console.log('--------------------------------')
  return url
}
