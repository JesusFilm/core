import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import { getJourneyMedia } from '../../../../../utils/getJourneyMedia/getJourneyMedia'

/**
 * Returns customizable image blocks for a given card block.
 * Includes nested image blocks e.g. poll option images.
 *
 * @param journey - The journey object containing blocks
 * @param cardBlockId - The id of the selected card block
 * @returns Array of customizable ImageBlock objects
 */
export function getCustomizableImageBlocks(
  journey: Journey | undefined | null,
  cardBlockId: string | null
): ImageBlock[] {
  if (journey == null || cardBlockId == null) return []

  const allBlocks = journey.blocks ?? []

  // Parent lookup: block id → parentBlockId, used to traverse ancestors when checking if an image belongs to this card.
  const parentMap = new Map<string, string | null>(
    allBlocks.map((b) => [b.id, b.parentBlockId])
  )

  // Check if this image block lives inside the card (handles nested blocks e.g. poll option images).
  const isDescendantOfCard = (blockId: string): boolean => {
    let currentId: string | null = blockId
    while (currentId != null) {
      if (currentId === cardBlockId) return true
      currentId = parentMap.get(currentId) ?? null
    }
    return false
  }

  const journeyMedia = getJourneyMedia(journey)
  return journeyMedia.filter(
    (block): block is ImageBlock =>
      block.__typename === 'ImageBlock' &&
      block.customizable === true &&
      isDescendantOfCard(block.id)
  )
}
