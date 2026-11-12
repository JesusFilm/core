import { getComponentType } from './mediaComponentType'

// Renditions made for distribution centers. They are partner-specific
// alternates of low/sd/high, served only to one API key, so they are not a
// download most clients can fetch.
const DISTRO_DOWNLOAD_QUALITIES = new Set([
  'distroLow',
  'distroSd',
  'distroHigh'
])

interface DownloadableVariant {
  hls?: string | null
  dash?: string | null
  downloadable?: boolean | null
  downloads?: ReadonlyArray<{ quality?: string | null }> | null
}

/**
 * Whether a media component is downloadable: the Variant's own flag is true,
 * it has playable media (a non-empty HLS or DASH URL), and it has at least one
 * download row of any quality except the distro* qualities (distroLow,
 * distroSd, distroHigh), which are alternates of low/sd/high for one partner.
 *
 * Every /media-components route uses this, so they cannot disagree with each
 * other. It mirrors isAlgoliaVideoDownloadable in api-media, which decides
 * what /resources reports. The raw flag alone is not enough: it defaults to
 * true, including on the generated parent Variants of a collection or series,
 * which have no media and no downloads.
 */
export function isMediaComponentDownloadable(
  variant: DownloadableVariant | null | undefined
): boolean {
  if (getComponentType(variant?.hls, variant?.dash) !== 'content') return false
  if (variant?.downloadable !== true) return false
  return (
    variant.downloads?.some(
      ({ quality }) => quality == null || !DISTRO_DOWNLOAD_QUALITIES.has(quality)
    ) ?? false
  )
}
