import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'

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
