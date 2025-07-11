/**
 * Helper functions for handling download quality fallback logic
 * for the specific API key that requires distro quality variants
 */

interface Download {
  quality: string
  url?: string
  size?: number
  height?: number
  width?: number
  bitrate?: number
}

const SPECIAL_API_KEY = '607f41540b2ca6.32427244'

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
 * Returns distro quality size if available for special API key, otherwise standard quality
 */
export function getDownloadSize(
  downloads: Download[] | null | undefined,
  standardQuality: string,
  apiKey?: string
): number {
  const download = findDownloadWithFallback(downloads, standardQuality, apiKey)
  return download?.size ?? 0
}
