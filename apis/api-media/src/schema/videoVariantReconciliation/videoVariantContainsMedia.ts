export type VideoVariantMedia = {
  hls?: string | null
  dash?: string | null
  share?: string | null
  masterUrl?: string | null
  duration?: number | null
  muxVideoId?: string | null
  assetId?: string | null
  downloads?: unknown[]
}

export function videoVariantContainsMedia(variant: VideoVariantMedia): boolean {
  return (
    Boolean(variant.hls) ||
    Boolean(variant.dash) ||
    Boolean(variant.share) ||
    Boolean(variant.masterUrl) ||
    Boolean(variant.muxVideoId) ||
    Boolean(variant.assetId) ||
    (variant.duration ?? 0) > 0 ||
    (variant.downloads?.length ?? 0) > 0
  )
}
