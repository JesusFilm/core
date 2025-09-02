/**
 * Helper functions for handling download quality fallback logic
 * for the specific API key that requires distro quality variants
 */

interface Download {
  quality: string
  url: string
  size: number
  height: number
  width: number
  bitrate: number
}

const SPECIAL_API_KEY = '607f41540b2ca6.32427244'

export function normalizeDownloads(downloads: Download[]): Download[] {
  return downloads.map((d) => ({
    quality: d.quality,
    url: d.url ?? '',
    size: d.size ?? 0,
    height: d.height ?? 0,
    width: d.width ?? 0,
    bitrate: d.bitrate ?? 0
  }))
}
/**
 * Maps standard quality to distro quality variants
 */
const qualityMapping: Record<string, string> = {
  low: 'distroLow',
  high: 'distroHigh',
  sd: 'distroSd'
}

/**
 * Finds a download with fallback logic based on API key.
 * For the specific API key '607f41540b2ca6.32427244', it tries distro qualities first,
 * then falls back to standard qualities.
 */
export function findDownloadWithFallback(
  downloads: Download[] | null | undefined,
  standardQuality: string,
  apiKey?: string
): Download | undefined {
  if (!downloads) return undefined

  const isSpecialApiKey = apiKey === SPECIAL_API_KEY
  const distroQuality = qualityMapping[standardQuality]

  if (isSpecialApiKey && distroQuality) {
    // Try distro quality first for the special API key
    const distroDownload = downloads.find((d) => d.quality === distroQuality)
    if (distroDownload) {
      return distroDownload
    }
  }

  // Fall back to standard quality
  const standardDownload = downloads.find((d) => d.quality === standardQuality)
  return standardDownload
}

/**
 * Helper function to get the best download size for a quality
 * Don't need distro because they don't use low and high download sizes
 */
export function getDownloadSize(
  downloads: Download[] | null | undefined,
  standardQuality: string
): number {
  if (!downloads) return 0

  const standardDownload = downloads.find((d) => d.quality === standardQuality)
  return standardDownload?.size ?? 0
}
