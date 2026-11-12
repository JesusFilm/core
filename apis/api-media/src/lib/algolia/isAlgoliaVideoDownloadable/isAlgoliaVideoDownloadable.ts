export interface AlgoliaDownloadableVariant {
  hls?: string | null
  dash?: string | null
  downloadable?: boolean | null
  downloads?: unknown[] | null
}

/**
 * Whether a Variant has playable media (a non-empty HLS or DASH URL).
 *
 * Shared by isAlgoliaVideoDownloadable and the componentType/contentType
 * classification in the indexer and checkVideoInAlgolia, so a DASH-only
 * Variant is never marked downloadable while still being classified as a
 * contentless container.
 */
export function hasAlgoliaPlayableMedia(
  variant: AlgoliaDownloadableVariant | null | undefined
): boolean {
  return Boolean(variant?.hls) || Boolean(variant?.dash)
}

/**
 * Whether a Video is downloadable in the Algolia index (and therefore in
 * /resources), judged from its published English Variant.
 *
 * One rule for every label: the Variant's own flag must be true, it must have
 * playable media (a non-empty HLS or DASH URL), and it must have at least one
 * download row. Clients show a Download button whenever isDownloadable is
 * true, with no check of their own, so a flag with nothing to download (for
 * example a generated parent Variant stored with hls: '' / dash: '' and no
 * downloads, where the column defaults to true) must not be trusted.
 *
 * A download row of any quality counts, deliberately including the distro*
 * qualities (renditions made for distribution centers). The caller must pass
 * every download row, not just low and high. The consequence: a Variant whose
 * only rows are distro* is downloadable here, although clients that look up
 * low/high (the downloadSizes fields) will find no file for it. Exclude
 * distro* here if that proves wrong in production data.
 *
 * Shared by the indexer and checkVideoInAlgolia so reconciliation computes
 * the same expected value the indexer writes.
 */
export function isAlgoliaVideoDownloadable(
  variant: AlgoliaDownloadableVariant | null | undefined
): boolean {
  const downloadable = variant?.downloadable ?? false
  const hasDownloads = (variant?.downloads?.length ?? 0) > 0
  return downloadable && hasAlgoliaPlayableMedia(variant) && hasDownloads
}
