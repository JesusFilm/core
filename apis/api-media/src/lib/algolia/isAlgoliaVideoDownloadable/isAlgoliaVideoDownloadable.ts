export interface AlgoliaDownloadableVariant {
  hls?: string | null
  dash?: string | null
  downloadable?: boolean | null
}

/**
 * Whether a Video is downloadable in the Algolia index (and therefore in
 * /resources), judged from its English Variant: the Variant's own flag is true
 * and it has playable media (a non-empty HLS or DASH URL).
 *
 * The same rule for every label. The media check matters because the
 * `downloadable` column defaults to true, including on the generated parent
 * Variants of a collection or series, which have no media and so nothing to
 * download. It is the rule the arclight media-components routes use, so
 * /resources agrees with them.
 *
 * Shared by the indexer and checkVideoInAlgolia so reconciliation computes the
 * same expected value the indexer writes.
 */
export function isAlgoliaVideoDownloadable(
  variant: AlgoliaDownloadableVariant | null | undefined
): boolean {
  const hasPlayableMedia = Boolean(variant?.hls) || Boolean(variant?.dash)
  return (variant?.downloadable ?? false) && hasPlayableMedia
}
