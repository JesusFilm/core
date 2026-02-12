import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { getJourneyMedia } from '../../../../../utils/getJourneyMedia/getJourneyMedia'

/**
 * Returns the first customizable video block that belongs to the given card.
 *
 * A video block is considered a match when:
 * - It has `__typename === 'VideoBlock'`
 * - It is marked as `customizable`
 * - Its `parentBlockId` matches the provided `cardBlockId`
 */
export function getCustomizableCardVideoBlock(
  journey: Journey | undefined,
  cardBlockId: string | null
): VideoBlock | null {
  if (journey == null || cardBlockId == null) return null

  const journeyMedia = getJourneyMedia(journey)

  const customizableVideoBlocks = journeyMedia.filter(
    (block): block is VideoBlock =>
      block.__typename === 'VideoBlock' &&
      block.customizable === true &&
      block.parentBlockId === cardBlockId
  )

  return customizableVideoBlocks[0] ?? null
}

/**
 * Shows the videos section on the media screen.
 *
 * The section is shown only when:
 * - A card is selected (`cardBlockId` is not null), and
 * - That card has at least one customizable video block.
 *
 * @param journey - the current journey containing blocks
 * @param cardBlockId - the id of the selected card block
 * @returns true if the videos section should be shown, false otherwise
 */
export function showVideosSection(
  journey: Journey | undefined,
  cardBlockId: string | null
): boolean {
  return getCustomizableCardVideoBlock(journey, cardBlockId) != null
}

/**
 * Returns a display title for the video block.
 * - YouTube/Mux: uses block-level `title`.
 * - Internal/Cloudflare: uses first title from `mediaVideo.title[]` (block-level title is not populated).
 */
export function getVideoBlockDisplayTitle(block: VideoBlock): string {
  if (block.title != null && block.title.trim() !== '') {
    return block.title
  }
  if (
    (block.source === VideoBlockSource.internal ||
      block.source === VideoBlockSource.cloudflare) &&
    block.mediaVideo?.__typename === 'Video' &&
    block.mediaVideo.title?.length
  ) {
    return block.mediaVideo.title[0].value ?? ''
  }
  return ''
}
