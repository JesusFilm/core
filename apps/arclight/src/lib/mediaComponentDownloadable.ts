import { getComponentType } from './mediaComponentType'

interface DownloadableVariant {
  hls?: string | null
  dash?: string | null
  downloadable?: boolean | null
  downloads?: readonly unknown[] | null
}

/**
 * Whether a media component is downloadable: the Variant's own flag is true,
 * it has playable media (a non-empty HLS or DASH URL), and it has at least one
 * download row of any quality.
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
  return (variant.downloads?.length ?? 0) > 0
}
