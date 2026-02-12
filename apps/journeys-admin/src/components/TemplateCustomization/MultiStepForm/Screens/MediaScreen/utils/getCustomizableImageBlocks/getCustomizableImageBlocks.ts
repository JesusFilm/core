import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey as Journey
} from '../../../../../../../../__generated__/GetJourney'
import { getJourneyMedia } from '../../../../../utils/getJourneyMedia/getJourneyMedia'

/**
 * Returns customizable image blocks for a given card block.
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

  const journeyMedia = getJourneyMedia(journey)
  return journeyMedia.filter(
    (block): block is ImageBlock =>
      block.__typename === 'ImageBlock' &&
      block.parentBlockId === cardBlockId &&
      block.customizable === true
  )
}
