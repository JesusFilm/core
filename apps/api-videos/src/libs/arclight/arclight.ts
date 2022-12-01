import fetch from 'node-fetch'
import { slugify } from '../slugify'

export interface ArclightMediaLanguage {
  languageId: number
  bcp47: string
  name: string
}

export interface Language extends ArclightMediaLanguage {
  slug: Translation[]
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
  slug: Translation[]
}

export interface ArclightMediaComponentLanguage {
  refId: string
  languageId: number
  lengthInMilliseconds: number
  subtitleUrls: {
    vtt?: Array<{
      languageId: number
      url: string
    }>
  }
  streamingUrls: {
    hls: Array<{
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

interface Translation {
  value: string
  languageId: string
  primary: boolean
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
  slug: Translation[]
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
  slug: Translation[]
  childIds: string[]
  noIndex: boolean
}

export async function getArclightMediaLanguages(): Promise<
  ArclightMediaLanguage[]
> {
  const response: {
    _embedded: { mediaLanguages: ArclightMediaLanguage[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-languages?limit=5000&filter=default&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaLanguages
}

export async function getArclightMediaComponents(): Promise<
  ArclightMediaComponent[]
> {
  const response: {
    _embedded: { mediaComponents: ArclightMediaComponent[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-components?limit=5000&isDeprecated=false&contentTypes=video&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaComponents
}

export async function getArclightMediaComponentLanguages(
  mediaComponentId: string
): Promise<ArclightMediaComponentLanguage[]> {
  const response: {
    _embedded: { mediaComponentLanguage: ArclightMediaComponentLanguage[] }
  } = await (
    await fetch(
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
    linkedMediaComponentIds: { contains: string[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-component-links/${mediaComponentId}?apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response.linkedMediaComponentIds.contains
}

export function transformArclightMediaComponentLanguageToVideoVariant(
  mediaComponentLanguage: ArclightMediaComponentLanguage,
  mediaComponent: MediaComponent,
  language: Language
): VideoVariant {
  const slugs = [
    {
      value: `${mediaComponent.slug[0].value}/${language.slug[0].value}`,
      languageId: mediaComponentLanguage.languageId.toString(),
      primary: true
    }
  ]
  if (mediaComponent.subType === 'series') {
    return {
      id: mediaComponentLanguage.refId,
      languageId: mediaComponentLanguage.languageId.toString(),
      duration: Math.round(mediaComponentLanguage.lengthInMilliseconds * 0.001),
      subtitle: [],
      downloads: [],
      slug: slugs
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
    hls: mediaComponentLanguage.streamingUrls.hls[0].url,
    languageId: mediaComponentLanguage.languageId.toString(),
    duration: Math.round(mediaComponentLanguage.lengthInMilliseconds * 0.001),
    downloads,
    slug: slugs
  }
}

export function transformArclightMediaComponentToVideo(
  mediaComponent: ArclightMediaComponent,
  mediaComponentLanguages: ArclightMediaComponentLanguage[],
  mediaComponentLinks: string[],
  languages: Language[],
  usedSlugs: string[]
): Video {
  const metadataLanguageId =
    languages
      .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
      ?.languageId.toString() ?? '529' // english by default

  console.log('content:', mediaComponent.mediaComponentId)

  const slug = [
    {
      value: slugify(mediaComponent.title, usedSlugs),
      languageId: metadataLanguageId,
      primary: true
    }
  ]

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
  usedSlugs: string[]
): Language {
  const slug = [
    {
      value: slugify(mediaLanguage.name, usedSlugs),
      languageId: mediaLanguage.languageId.toString(),
      primary: true
    }
  ]
  return {
    ...mediaLanguage,
    slug
  }
}

export async function fetchMediaComponentsAndTransformToVideos(): Promise<
  Video[]
> {
  const usedVideoSlugs = []
  const usedLanguageSlugs = []
  const mediaLanguages = await getArclightMediaLanguages()
  const mediaComponents = await getArclightMediaComponents()
  const languages = mediaLanguages.map((mediaLanguage) =>
    transformArclightMediaLanguageToLanguage(mediaLanguage, usedLanguageSlugs)
  )

  return await Promise.all(
    mediaComponents.map(async (mediaComponent) => {
      console.log(`mediaComponent:`, mediaComponent.mediaComponentId)
      const mediaComponentLinks = await getArclightMediaComponentLinks(
        mediaComponent.mediaComponentId
      )
      const mediaComponentLanguages = await getArclightMediaComponentLanguages(
        mediaComponent.mediaComponentId
      )
      return transformArclightMediaComponentToVideo(
        mediaComponent,
        mediaComponentLanguages,
        mediaComponentLinks,
        languages,
        usedVideoSlugs
      )
    })
  )
}
