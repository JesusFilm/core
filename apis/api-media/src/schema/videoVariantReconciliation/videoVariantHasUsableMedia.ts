export type VideoVariantUsableMedia = {
  hls?: string | null
  share?: string | null
  muxVideo?: { readyToStream?: boolean | null } | null
}

// A Variant is publishable once viewers would actually get playable media for
// it. Both the reconciliation sweep and videoVariantUpdate gate publication on
// this, so an editor publishing a Variant whose Mux asset is still transcoding
// waits for the sweep instead of putting a dead Variant on the watch site.
export function videoVariantHasUsableMedia(
  variant: VideoVariantUsableMedia | null | undefined
): boolean {
  if (variant == null) return false

  return (
    variant.muxVideo?.readyToStream === true ||
    Boolean(variant.hls) ||
    Boolean(variant.share)
  )
}
