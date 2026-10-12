import { fetchWatchVideoById } from '../../gatewayClient'
import { badUserInput } from '../../validation'
import { resolveWatchUrl } from '../video/watchUrl'

export interface CarouselVideoInput {
  url?: string | null
  videoId?: string | number | null
  videoVariantLanguageId?: string | number | null
}

export interface CarouselVideoColumns {
  videoId?: string | null
  videoVariantLanguageId?: string | null
}

/**
 * The carousel's mode is its nullable `videoId`. A pasted Watch `url` is
 * resolved through its variant slug to a Video of any label; a `videoId`
 * (what undo writes back) must be a published Watch Video; either way the
 * variant language is the one given, else the campaign language. `videoId:
 * null` switches to explicit mode and clears both columns. Omitted leaves
 * the mode alone.
 */
export async function validateCarouselVideo(
  input: CarouselVideoInput,
  campaignLanguageId: string
): Promise<CarouselVideoColumns> {
  const languageId =
    input.videoVariantLanguageId != null
      ? String(input.videoVariantLanguageId)
      : campaignLanguageId
  if (input.url != null) {
    if (input.videoId !== undefined)
      throw badUserInput('give either url or videoId', 'url')
    return {
      videoId: await resolveWatchUrl(input.url),
      videoVariantLanguageId: languageId
    }
  }
  if (input.videoId === undefined) {
    if (input.videoVariantLanguageId !== undefined)
      throw badUserInput(
        'videoVariantLanguageId is set together with videoId',
        'videoVariantLanguageId'
      )
    return {}
  }
  if (input.videoId === null)
    return { videoId: null, videoVariantLanguageId: null }
  const video = await fetchWatchVideoById(String(input.videoId))
  if (video == null)
    throw badUserInput('videoId is not a published Watch video', 'videoId')
  return { videoId: video.id, videoVariantLanguageId: languageId }
}
