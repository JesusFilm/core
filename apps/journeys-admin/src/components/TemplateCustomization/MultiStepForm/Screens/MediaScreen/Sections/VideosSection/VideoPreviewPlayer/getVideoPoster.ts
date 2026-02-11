import type { GetJourney_journey_blocks_VideoBlock } from '../../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

/**
 * Derives the poster (thumbnail) URL for a journey VideoBlock based on its source.
 *
 * - **Mux:** Mux image API thumbnail for the playback ID.
 * - **YouTube:** Block's stored image URL (thumbnail).
 * - **Internal (Video):** First image from mediaVideo (e.g. mobileCinematicHigh).
 *
 * @param videoBlock - Video block from journey (e.g. from getCustomizableCardVideoBlock).
 * @returns Poster URL string, or undefined if none available.
 */
export function getVideoPoster(
  videoBlock: GetJourney_journey_blocks_VideoBlock
): string | undefined {
  const { source, mediaVideo } = videoBlock

  if (
    source === VideoBlockSource.mux &&
    mediaVideo?.__typename === 'MuxVideo' &&
    mediaVideo.playbackId != null
  ) {
    return `https://image.mux.com/${mediaVideo.playbackId}/thumbnail.png?time=1`
  }

  if (source === VideoBlockSource.youTube && videoBlock.image != null) {
    return videoBlock.image
  }

  if (
    (source === VideoBlockSource.internal ||
      source === VideoBlockSource.cloudflare) &&
    mediaVideo?.__typename === 'Video'
  ) {
    return mediaVideo.images[0]?.mobileCinematicHigh ?? undefined
  }

  return undefined
}
