const CONTAINER_LABELS = new Set(['collection', 'series'])

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
 * A collection or series is a container: clients show a Download button
 * whenever isDownloadable is true, with no container check of their own. So
 * a container is only downloadable when its own Variant has playable media
 * (a non-empty HLS or DASH URL) and download files. Generated parent Variants
 * are stored with hls: '' / dash: '' and no downloads, but the column
 * defaults to true, so the flag alone must not be trusted for a container.
 *
 * Every other label keeps following the Variant's own flag.
 *
 * Shared by the indexer and checkVideoInAlgolia so reconciliation computes
 * the same expected value the indexer writes.
 */
export function isAlgoliaVideoDownloadable(
  label: string,
  variant: AlgoliaDownloadableVariant | null | undefined
): boolean {
  const downloadable = variant?.downloadable ?? false
  if (!CONTAINER_LABELS.has(label)) return downloadable

  const hasDownloads = (variant?.downloads?.length ?? 0) > 0
  return downloadable && hasAlgoliaPlayableMedia(variant) && hasDownloads
}
