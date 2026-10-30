import { isHttpsUrl } from '../isHttpsUrl'

export interface CampaignImageSource {
  src: string
  alt: string | null
  width: number | null
  height: number | null
  /** The focal point as percentages from the left and the top; the centre when unset. */
  focalLeft: number
  focalTop: number
  /** Zoom around the focal point as a percentage; 100 (none) when unset. */
  scale: number
}

/** The CSS `object-position` that keeps a picture's focal point in view when it is scaled to fill. */
export function focalObjectPosition(
  image: Pick<CampaignImageSource, 'focalLeft' | 'focalTop'>
): string {
  return `${image.focalLeft}% ${image.focalTop}%`
}

/**
 * The CSS that crops a picture around its focal point when it is scaled to
 * fill: `object-position` on the point, and a `transform` scale from that
 * point when the picture is zoomed. The element must sit in a frame that
 * clips overflow, since a transform paints outside the element's box.
 */
export function focalImageSx(
  image: Pick<CampaignImageSource, 'focalLeft' | 'focalTop' | 'scale'>
): { objectPosition: string; transform?: string; transformOrigin?: string } {
  const objectPosition = focalObjectPosition(image)
  if (image.scale <= 100) return { objectPosition }
  return {
    objectPosition,
    transform: `scale(${image.scale / 100})`,
    transformOrigin: objectPosition
  }
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
  scale?: number | null
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
 * Null for an empty slot, a block with nothing to show, or a `src` that is
 * not an https URL (any host: journey images are not all on Cloudflare).
 */
export function campaignImageSource(
  block: CampaignMediaColumns | null | undefined
): CampaignImageSource | null {
  if (block == null) return null
  const src =
    block.__typename === 'CampaignVideoBlock' ? videoPoster(block) : block.src
  if (src == null || !isHttpsUrl(src)) return null
  return {
    src,
    alt: block.alt ?? null,
    width: block.width ?? null,
    height: block.height ?? null,
    focalLeft: block.focalLeft ?? 50,
    focalTop: block.focalTop ?? 50,
    scale: block.scale ?? 100
  }
}
