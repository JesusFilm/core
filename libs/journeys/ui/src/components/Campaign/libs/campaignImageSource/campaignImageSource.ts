export interface CampaignImageSource {
  src: string
  alt: string | null
  width: number | null
  height: number | null
  /** The focal point as percentages from the left and the top; the centre when unset. */
  focalLeft: number
  focalTop: number
}

/** The CSS `object-position` that keeps a picture's focal point in view when it is scaled to fill. */
export function focalObjectPosition(
  image: Pick<CampaignImageSource, 'focalLeft' | 'focalTop'>
): string {
  return `${image.focalLeft}% ${image.focalTop}%`
}

/**
 * The media columns an owned slot block may carry (image `src`, video poster
 * `image`, or a Watch video's banner through `mediaVideo`).
 */
interface CampaignMediaColumns {
  __typename: string
  src?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  image?: string | null
  focalLeft?: number | null
  focalTop?: number | null
  mediaVideo?: {
    __typename: string
    images?: Array<{ mobileCinematicHigh: string | null }>
  } | null
}

function videoPoster(block: CampaignMediaColumns): string | null | undefined {
  if (block.image != null && block.image.trim() !== '') return block.image
  if (block.mediaVideo?.__typename !== 'Video') return null
  return block.mediaVideo.images?.[0]?.mobileCinematicHigh
}

/**
 * The image an owned slot block (a cover, logo or Media Slot) renders: a
 * `CampaignImageBlock`'s `src`, or a `CampaignVideoBlock`'s poster — the
 * `image` captured at pick for YouTube and Mux, else a Watch video's banner.
 * Null for an empty slot or a block with nothing to show.
 */
export function campaignImageSource(
  block: CampaignMediaColumns | null | undefined
): CampaignImageSource | null {
  if (block == null) return null
  const src =
    block.__typename === 'CampaignVideoBlock' ? videoPoster(block) : block.src
  if (src == null || src.trim() === '') return null
  return {
    src,
    alt: block.alt ?? null,
    width: block.width ?? null,
    height: block.height ?? null,
    focalLeft: block.focalLeft ?? 50,
    focalTop: block.focalTop ?? 50
  }
}
