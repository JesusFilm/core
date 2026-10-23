import { badUserInput } from '../../errors'
import { fetchLanguage, fetchWatchVideoById } from '../../gatewayClient'
import { assertNotNull } from '../../validation'
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

/** The variant language: the one given, which must exist, else the fallback. */
async function resolveVariantLanguageId(
  input: CarouselVideoInput,
  campaignLanguageId: string
): Promise<string> {
  if (input.videoVariantLanguageId == null) return campaignLanguageId
  const languageId = String(input.videoVariantLanguageId)
  if ((await fetchLanguage(languageId)) == null)
    throw badUserInput(
      'videoVariantLanguageId must be an existing language',
      'videoVariantLanguageId'
    )
  return languageId
}

/**
 * The carousel's mode is its nullable `videoId`. A pasted Watch `url` is
 * resolved through its variant slug to a Video of any label; a `videoId`
 * (what undo writes back) must be a published Watch Video. The variant
 * language is the one given (it must exist in api-languages), else the one
 * the pasted address named, else the campaign language. `videoId: null`
 * switches to explicit mode and clears both columns. Omitted leaves the mode
 * alone.
 */
export async function validateCarouselVideo(
  input: CarouselVideoInput,
  campaignLanguageId: string
): Promise<CarouselVideoColumns> {
  const url = assertNotNull(input.url, 'url')
  if (url !== undefined) {
    if (input.videoId !== undefined)
      throw badUserInput('give either url or videoId', 'url')
    const watch = await resolveWatchUrl(url)
    return {
      videoId: watch.videoId,
      videoVariantLanguageId: await resolveVariantLanguageId(
        input,
        watch.languageId ?? campaignLanguageId
      )
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
  return {
    videoId: video.id,
    videoVariantLanguageId: await resolveVariantLanguageId(
      input,
      campaignLanguageId
    )
  }
}
