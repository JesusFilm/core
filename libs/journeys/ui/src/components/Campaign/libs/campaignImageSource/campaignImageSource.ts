export interface CampaignImageSource {
  src: string
  alt: string | null
  width: number | null
  height: number | null
}

/** The media columns an owned slot block may carry (image `src`, video poster `image`). */
interface CampaignMediaColumns {
  __typename: string
  src?: string | null
  alt?: string | null
  width?: number | null
  height?: number | null
  image?: string | null
}

/**
 * The image an owned slot block (a cover, logo or Media Slot) renders: a
 * `CampaignImageBlock`'s `src`, or a `CampaignVideoBlock`'s poster `image`.
 * Null for an empty slot or a block with nothing to show. Reads the media
 * columns structurally, so it works as soon as the media ticket adds those
 * typenames to the public payload.
 */
export function campaignImageSource(
  block: CampaignMediaColumns | null | undefined
): CampaignImageSource | null {
  if (block == null) return null
  const src =
    block.__typename === 'CampaignVideoBlock' ? block.image : block.src
  if (src == null || src.trim() === '') return null
  return {
    src,
    alt: block.alt ?? null,
    width: block.width ?? null,
    height: block.height ?? null
  }
}
