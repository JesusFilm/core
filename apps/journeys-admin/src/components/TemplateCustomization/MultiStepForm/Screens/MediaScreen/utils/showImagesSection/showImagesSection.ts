import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { getJourneyMedia } from '../../../utils/getJourneyMedia/getJourneyMedia'

/**
 * Shows the images section on the media screen.
 * Checks if the selected card has customizable image blocks.
 *
 * @param journey - The journey object containing blocks
 * @param cardBlockId - The id of the selected card block
 * @returns true if the images section should be shown, false otherwise
 */
export function showImagesSection(
  journey: Journey | undefined,
  cardBlockId: string | null
): boolean {
  if (!journey || !cardBlockId) {
    return false
  }

  const journeyMedia = getJourneyMedia(journey)
  const imageBlocks = journeyMedia.filter(
    (block) =>
      block.__typename === 'ImageBlock' &&
      block.parentBlockId === cardBlockId &&
      block.customizable === true
  )
  return imageBlocks.length > 0
}
