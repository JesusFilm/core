import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_CardBlock as CardBlock
} from '../../../../../../../__generated__/GetJourney'

export type JourneyMedia = ImageBlock | VideoBlock

// TODO: TEMP - Remove after mergin NES-1305

export function getJourneyMedia(journey?: Journey): JourneyMedia[] {
  const customizableLogoBlock = journey?.logoImageBlock?.customizable
    ? [journey?.logoImageBlock]
    : []
  const customizableImageBlocks =
    journey?.blocks?.filter(
      (block): block is ImageBlock =>
        block.__typename === 'ImageBlock' && block.customizable === true
    ) ?? []
  const customizableVideoBlocks =
    journey?.blocks?.filter(
      (block): block is VideoBlock =>
        block.__typename === 'VideoBlock' && block.customizable === true
    ) ?? []
  return [
    ...customizableLogoBlock,
    ...customizableImageBlocks,
    ...customizableVideoBlocks
  ]
}

/**
 * Gets all customizable image blocks that belong to a specific card block.
 *
 * @param journey - The journey object containing blocks
 * @param cardBlockId - The id of the card block to filter by
 * @returns Array of ImageBlock objects that are children of the specified card
 */
export function getCardImageBlocks(
  journey: Journey | undefined,
  cardBlockId: string | null
): ImageBlock[] {
  if (!journey || !cardBlockId || !journey.blocks) {
    return []
  }

  return journey.blocks.filter(
    (block): block is ImageBlock =>
      block.__typename === 'ImageBlock' &&
      block.parentBlockId === cardBlockId &&
      block.customizable === true
  )
}

/**
 * Finds the first card block in the journey that has customizable image blocks.
 *
 * @param journey - The journey object containing blocks
 * @returns The id of the first card with image blocks, or null if none found
 */
export function getFirstCardWithImages(
  journey: Journey | undefined
): string | null {
  if (!journey || !journey.blocks) {
    return null
  }

  const cardBlocks = journey.blocks.filter(
    (block): block is CardBlock => block.__typename === 'CardBlock'
  )

  for (const card of cardBlocks) {
    const imageBlocks = getCardImageBlocks(journey, card.id)
    if (imageBlocks.length > 0) {
      return card.id
    }
  }

  return null
}
