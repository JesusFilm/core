export type VideoVariantUsableMedia = {
  hls?: string | null
  share?: string | null
  muxVideo?: { readyToStream?: boolean | null } | null
}

// A Variant is publishable once viewers would actually get playable media for
// it. The reconciliation sweep gates publication on this; videoVariantUpdate
// gates on videoVariantAwaitsMux below instead.
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

// The only publish worth deferring: a linked Mux asset still transcoding and
// nothing else playable yet, so publishing now would put a dead Variant on
// the watch site. Everything else -- including a Variant with no media and no
// Mux asset at all, such as a collection's own Variant -- has nothing left to
// wait for, and videoVariantUpdate publishes it inline.
export function videoVariantAwaitsMux(
  variant: VideoVariantUsableMedia | null | undefined
): boolean {
  if (variant?.muxVideo == null) return false

  return !videoVariantHasUsableMedia(variant)
}
