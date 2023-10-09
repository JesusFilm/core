import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch'

import {
  Prisma,
  VideoLabel,
  VideoVariantDownloadQuality
} from '.prisma/api-videos-client'

import { PrismaVideoCreateInput } from '../postgresql'
import { slugify } from '../slugify'

export interface ArclightMediaLanguage {
  languageId: number
  bcp47: string
  name: string
}

export interface Language extends ArclightMediaLanguage {
  slug: string
}

export interface ArclightMediaComponent {
  mediaComponentId: string
  primaryLanguageId: number
  title: string
  shortDescription: string
  longDescription: string
  metadataLanguageTag: string
  imageUrls: {
    mobileCinematicHigh: string
  }
  subType: string
  studyQuestions: string[]
}

export interface MediaComponent extends ArclightMediaComponent {
  slug: string
}

export interface ArclightMediaComponentLanguage {
  refId: string
  languageId: number
  lengthInMilliseconds?: number
  subtitleUrls: {
    vtt?: Array<{
      languageId: number
      url: string
    }>
  }
  streamingUrls: {
    hls?: Array<{
      url: string
    }>
  }
  downloadUrls: {
    low?: {
      url: string
      sizeInBytes: number
    }
    high?: {
      url: string
      sizeInBytes: number
    }
  }
}

async function fetchPlus(
  url: RequestInfo,
  init?: RequestInit,
  retries = 3
): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (error) {
    if (error.name === 'FetchError' && retries > 0) {
      return await fetchPlus(url, init, retries - 1)
    }
    throw new Error(error)
  }
}

export async function getArclightMediaLanguages(): Promise<
  ArclightMediaLanguage[]
> {
  const response: {
    _embedded: { mediaLanguages: ArclightMediaLanguage[] }
  } = await (
    await fetchPlus(
      `https://api.arclight.org/v2/media-languages?limit=5000&filter=default&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaLanguages
}

export async function getArclightMediaComponent(
  id: string
): Promise<ArclightMediaComponent | null> {
  return await (
    await fetchPlus(
      `https://api.arclight.org/v2/media-components/${id}?apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
}

export async function getArclightMediaComponents(
  page: number
): Promise<ArclightMediaComponent[]> {
  const response: {
    _embedded: { mediaComponents: ArclightMediaComponent[] }
    message?: string
  } = await (
    await fetchPlus(
      `https://api.arclight.org/v2/media-components?limit=10&isDeprecated=false&contentTypes=video&page=${page}&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  if (
    response.message?.match(
      /Page \[\d\d\] does not exist. Given a limit of \[10\] per page, value must not be greater than \[\d\d\]\./
    ) != null
  )
    return []
  return response._embedded.mediaComponents
}

export async function getArclightMediaComponentLanguages(
  mediaComponentId: string
): Promise<ArclightMediaComponentLanguage[]> {
  const response: {
    _embedded: {
      mediaComponentLanguage: ArclightMediaComponentLanguage[]
    } | null
  } = await (
    await fetchPlus(
      `https://api.arclight.org/v2/media-components/${mediaComponentId}/languages?platform=android&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded?.mediaComponentLanguage ?? []
}

export async function getArclightMediaComponentLinks(
  mediaComponentId: string
): Promise<string[]> {
  const response: {
    linkedMediaComponentIds: { contains?: string[] }
  } = await (
    await fetchPlus(
      `https://api.arclight.org/v2/media-component-links/${mediaComponentId}?apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response.linkedMediaComponentIds?.contains ?? []
}

export function transformArclightMediaComponentLanguageToVideoVariant(
  mediaComponentLanguage: ArclightMediaComponentLanguage,
  mediaComponent: MediaComponent,
  language: Language
): Omit<Prisma.VideoVariantUncheckedCreateInput, 'downloads' | 'subtitle'> & {
  downloads?: Prisma.VideoVariantDownloadUncheckedCreateInput[]
  subtitle?: Prisma.VideoVariantSubtitleUncheckedCreateInput[]
} {
  const slug = `${mediaComponent.slug}/${language.slug}`
  if (mediaComponent.subType === 'series') {
    return {
      id: mediaComponentLanguage.refId,
      languageId: mediaComponentLanguage.languageId.toString(),
      duration: Math.round(
        (mediaComponentLanguage.lengthInMilliseconds ?? 0) * 0.001
      ),
      subtitle: [],
      slug,
      hls: null,
      videoId: mediaComponent.mediaComponentId
    }
  }
  const downloads: Prisma.VideoVariantDownloadUncheckedCreateInput[] = []
  for (const [key, value] of Object.entries(
    mediaComponentLanguage.downloadUrls
  )) {
    downloads.push({
      videoVariantId: mediaComponentLanguage.refId,
      quality: VideoVariantDownloadQuality[key],
      size: value.sizeInBytes,
      url: value.url
    })
  }

  return {
    id: mediaComponentLanguage.refId,
    subtitle:
      mediaComponentLanguage.subtitleUrls.vtt?.map(({ languageId, url }) => ({
        videoVariantId: mediaComponentLanguage.refId,
        languageId: languageId.toString(),
        value: url,
        primary: languageId === mediaComponentLanguage.languageId
      })) ?? [],
    hls: mediaComponentLanguage.streamingUrls.hls?.[0].url ?? null,
    languageId: mediaComponentLanguage.languageId.toString(),
    duration: Math.round(
      (mediaComponentLanguage.lengthInMilliseconds ?? 0) * 0.001
    ),
    downloads,
    slug,
    videoId: mediaComponent.mediaComponentId
  }
}

export function transformArclightMediaComponentToVideo(
  mediaComponent: ArclightMediaComponent,
  mediaComponentLanguages: ArclightMediaComponentLanguage[],
  languages: Language[],
  usedSlugs: Record<string, string>
): PrismaVideoCreateInput {
  const metadataLanguageId =
    languages
      .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
      ?.languageId.toString() ?? '529' // english by default

  const slug = slugify(
    mediaComponent.mediaComponentId,
    mediaComponent.title,
    usedSlugs
  )

  const variants: Array<
    Omit<Prisma.VideoVariantUncheckedCreateInput, 'downloads' | 'subtitle'> & {
      downloads?: Prisma.VideoVariantDownloadUncheckedCreateInput[]
      subtitle?: Prisma.VideoVariantSubtitleUncheckedCreateInput[]
    }
  > = []
  for (const mediaComponentLanguage of mediaComponentLanguages) {
    const language = languages.find(
      ({ languageId }) => languageId === mediaComponentLanguage.languageId
    )
    if (language == null || mediaComponentLanguage == null) continue

    variants.push(
      transformArclightMediaComponentLanguageToVideoVariant(
        mediaComponentLanguage,
        { ...mediaComponent, slug },
        language
      )
    )
  }

  return {
    id: mediaComponent.mediaComponentId,
    label: VideoLabel[mediaComponent.subType],
    primaryLanguageId: mediaComponent.primaryLanguageId.toString(),
    title: [
      {
        videoId: mediaComponent.mediaComponentId,
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      }
    ],
    seoTitle: [
      {
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      }
    ],
    snippet: [
      {
        value: mediaComponent.shortDescription,
        languageId: metadataLanguageId,
        primary: true
      }
    ],
    description: [
      {
        value: mediaComponent.longDescription,
        languageId: metadataLanguageId,
        primary: true
      }
    ],
    studyQuestions: mediaComponent.studyQuestions.map((studyQuestion) => ({
      languageId: metadataLanguageId,
      value: studyQuestion,
      primary: true
    })),
    image: mediaComponent.imageUrls.mobileCinematicHigh,
    imageAlt: [
      {
        value:
          mediaComponent.title.length <= 100
            ? mediaComponent.title
            : mediaComponent.title.substring(0, 99),
        languageId: metadataLanguageId,
        primary: true
      }
    ],
    variants,
    slug,
    noIndex: false
  }
}

export function transformArclightMediaLanguageToLanguage(
  mediaLanguage: ArclightMediaLanguage,
  usedSlugs: Record<string, string>
): Language {
  const slug = slugify(
    mediaLanguage.languageId.toString(),
    mediaLanguage.name,
    usedSlugs
  )
  return {
    ...mediaLanguage,
    slug
  }
}

export async function fetchMediaLanguagesAndTransformToLanguages(): Promise<
  Language[]
> {
  const usedLanguageSlugs: Record<string, string> = {}
  const mediaLanguages = await getArclightMediaLanguages()
  return mediaLanguages.map((mediaLanguage) =>
    transformArclightMediaLanguageToLanguage(mediaLanguage, usedLanguageSlugs)
  )
}

export async function transformMediaComponentToVideo(
  mediaComponent: ArclightMediaComponent,
  languages: Language[],
  usedVideoSlugs: Record<string, string>
): Promise<PrismaVideoCreateInput> {
  console.log(`fetching mediaComponent:`, mediaComponent.mediaComponentId)
  const mediaComponentLanguages = await getArclightMediaComponentLanguages(
    mediaComponent.mediaComponentId
  )

  return transformArclightMediaComponentToVideo(
    mediaComponent,
    mediaComponentLanguages,
    languages,
    usedVideoSlugs
  )
}
