import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch'

import { Translation } from '@core/nest/common/TranslationModule'

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

interface Download {
  quality: string
  size: number
  url: string
}

interface VideoVariant {
  id: string
  subtitle: Translation[]
  hls?: string
  languageId: string
  duration: number
  downloads: Download[]
  slug: string
}

export interface Video {
  _key: string
  label: string
  primaryLanguageId: string
  title: Translation[]
  seoTitle: Translation[]
  snippet: Translation[]
  description: Translation[]
  studyQuestions: Translation[]
  image: string
  imageAlt: Translation[]
  variants: VideoVariant[]
  slug: string
  childIds: string[]
  noIndex: boolean
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

export async function getArclightMediaComponents(
  page: number
): Promise<ArclightMediaComponent[]> {
  const response: {
    _embedded: { mediaComponents: ArclightMediaComponent[] }
    message?: string
  } = await (
    await fetchPlus(
      `https://api.arclight.org/v2/media-components?limit=25&isDeprecated=false&contentTypes=video&page=${page}&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  if (
    response.message?.match(
      /Page \[\d\d\] does not exist. Given a limit of \[25\] per page, value must not be greater than \[\d\d\]\./
    ) != null
  )
    return []
  return response._embedded.mediaComponents
}

export async function getArclightMediaComponentLanguages(
  mediaComponentId: string
): Promise<ArclightMediaComponentLanguage[]> {
  const response: {
    _embedded: { mediaComponentLanguage: ArclightMediaComponentLanguage[] }
  } = await (
    await fetchPlus(
      `https://api.arclight.org/v2/media-components/${mediaComponentId}/languages?platform=android&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaComponentLanguage
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
  return response.linkedMediaComponentIds.contains ?? []
}

export function transformArclightMediaComponentLanguageToVideoVariant(
  mediaComponentLanguage: ArclightMediaComponentLanguage,
  mediaComponent: MediaComponent,
  language: Language
): VideoVariant {
  const slug = `${mediaComponent.slug}/${language.slug}`
  if (mediaComponent.subType === 'series') {
    return {
      id: mediaComponentLanguage.refId,
      languageId: mediaComponentLanguage.languageId.toString(),
      duration: Math.round(
        (mediaComponentLanguage.lengthInMilliseconds ?? 0) * 0.001
      ),
      subtitle: [],
      downloads: [],
      slug
    }
  }
  const downloads: Download[] = []
  for (const [key, value] of Object.entries(
    mediaComponentLanguage.downloadUrls
  )) {
    downloads.push({
      quality: key,
      size: value.sizeInBytes,
      url: value.url
    })
  }
  return {
    id: mediaComponentLanguage.refId,
    subtitle:
      mediaComponentLanguage.subtitleUrls.vtt?.map(({ languageId, url }) => ({
        languageId: languageId.toString(),
        value: url,
        primary: languageId === mediaComponentLanguage.languageId
      })) ?? [],
    hls: mediaComponentLanguage.streamingUrls.hls?.[0].url,
    languageId: mediaComponentLanguage.languageId.toString(),
    duration: Math.round(
      (mediaComponentLanguage.lengthInMilliseconds ?? 0) * 0.001
    ),
    downloads,
    slug
  }
}

export function transformArclightMediaComponentToVideo(
  mediaComponent: ArclightMediaComponent,
  mediaComponentLanguages: ArclightMediaComponentLanguage[],
  mediaComponentLinks: string[],
  languages: Language[],
  usedSlugs: Record<string, string>
): Video {
  const metadataLanguageId =
    languages
      .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
      ?.languageId.toString() ?? '529' // english by default

  const slug = slugify(
    mediaComponent.mediaComponentId,
    mediaComponent.title,
    usedSlugs
  )

  const variants: VideoVariant[] = []
  for (const mediaComponentLanguage of mediaComponentLanguages) {
    const language = languages.find(
      ({ languageId }) => languageId === mediaComponentLanguage.languageId
    )
    if (language == null) continue

    variants.push(
      transformArclightMediaComponentLanguageToVideoVariant(
        mediaComponentLanguage,
        { ...mediaComponent, slug },
        language
      )
    )
  }

  return {
    _key: mediaComponent.mediaComponentId,
    label: mediaComponent.subType,
    primaryLanguageId: mediaComponent.primaryLanguageId.toString(),
    title: [
      {
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
    studyQuestions: mediaComponent.studyQuestions.map((studyQuestion) => {
      return {
        languageId: metadataLanguageId,
        value: studyQuestion,
        primary: true
      }
    }),
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
    childIds: mediaComponentLinks,
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

export async function fetchMediaComponentsAndTransformToVideos(
  languages: Language[],
  usedVideoSlugs: Record<string, string>,
  page: number
): Promise<Video[]> {
  const mediaComponents = await getArclightMediaComponents(page)

  const mediaComponentsAndMetadata = await Promise.all(
    mediaComponents.map(async (mediaComponent) => {
      console.log(`fetching mediaComponent:`, mediaComponent.mediaComponentId)
      const mediaComponentLanguages = await getArclightMediaComponentLanguages(
        mediaComponent.mediaComponentId
      )
      const mediaComponentLinks = await getArclightMediaComponentLinks(
        mediaComponent.mediaComponentId
      )
      return { mediaComponent, mediaComponentLanguages, mediaComponentLinks }
    })
  )

  return mediaComponentsAndMetadata.map(
    ({ mediaComponent, mediaComponentLanguages, mediaComponentLinks }) => {
      return transformArclightMediaComponentToVideo(
        mediaComponent,
        mediaComponentLanguages,
        mediaComponentLinks,
        languages,
        usedVideoSlugs
      )
    }
  )
}
