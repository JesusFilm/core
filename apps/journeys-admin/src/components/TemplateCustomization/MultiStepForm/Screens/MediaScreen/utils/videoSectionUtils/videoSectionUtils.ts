import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { getJourneyMedia } from '../../../../../utils/getJourneyMedia'

const YOUTUBE_ID_REGEX = /^[0-9A-Za-z_-]{11}$/
const YOUTUBE_HOST_REGEX =
  /(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)youtube-nocookie\.com$/

/**
 * Extracts an 11-character YouTube video ID from a URL.
 *
 * Validates the hostname belongs to a known YouTube domain before extracting.
 * Supports standard watch URLs, youtu.be short links, shorts, and embed URLs.
 * Returns null when no valid ID can be found or the host is not YouTube.
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.toLowerCase()
    if (!YOUTUBE_HOST_REGEX.test(host)) return null

    const candidate = host.endsWith('youtu.be')
      ? parsed.pathname.split('/').filter(Boolean)[0]
      : (parsed.searchParams.get('v') ??
        parsed.pathname.split('/').filter(Boolean).at(-1))

    return candidate != null && YOUTUBE_ID_REGEX.test(candidate)
      ? candidate
      : null
  } catch {
    return null
  }
}

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
 * Derives the poster (thumbnail) URL for a journey VideoBlock based on its source.
 *
 * - **Mux:** Mux image API thumbnail for the playback ID.
 * - **YouTube:** Block's stored image URL (thumbnail).
 * - **Internal (Video):** First image from mediaVideo (e.g. mobileCinematicHigh).
 *
 * @param videoBlock - Video block from journey (e.g. from getCustomizableCardVideoBlock).
 * @returns Poster URL string, or undefined if none available.
 */
export function getVideoPoster(videoBlock: VideoBlock): string | undefined {
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
