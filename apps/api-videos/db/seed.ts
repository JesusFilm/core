import { aql } from 'arangojs'
import fetch from 'node-fetch'
import slugify from 'slugify'
import { VideoType } from '../src/app/__generated__/graphql'
import { ArangoDB } from './db'

interface Video {
  _key: string
}

const db = ArangoDB()

interface MediaComponent {
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

interface MediaComponentLanguage {
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

interface Language {
  languageId: number
  bcp47: string
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
}

interface Video {
  type: VideoType
  primaryLanguageId: string
  title: Translation[]
  snippet: Translation[]
  description: Translation[]
  studyQuestions: Translation[][]
  image: string
  variants: VideoVariant[]
  tagIds: string[]
  permalink: string
  episodeIds: string[]
}

interface Tag {
  _key: string
  title: Translation[]
}

const tags: Record<string, Tag> = {}

async function getLanguages(): Promise<Language[]> {
  const response: {
    _embedded: { mediaLanguages: Language[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-languages?limit=5000&filter=default&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaLanguages
}

async function getMediaComponents(
  type: 'content' | 'container'
): Promise<MediaComponent[]> {
  const response: {
    _embedded: { mediaComponents: MediaComponent[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-components?limit=5000&isDeprecated=false&type=${type}&contentTypes=video&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaComponents
}

async function getMediaComponentLanguage(
  mediaComponentId: string
): Promise<MediaComponentLanguage[]> {
  const response: {
    _embedded: { mediaComponentLanguage: MediaComponentLanguage[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-components/${mediaComponentId}/languages?platform=android&apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaComponentLanguage
}

const usedTitles: string[] = []

function getIteration(slug: string): string {
  const exists = usedTitles.find((t) => t === slug)
  if (exists != null) {
    const iteration = slug.match(/-(\d+)$/)
    const title =
      iteration == null
        ? `${slug}-2`
        : `${slug}-${parseInt(iteration[iteration.length - 1]) + 1}`
    return getIteration(title)
  }
  return slug
}

function getSeoTitle(title: string): string {
  const slug = slugify(title, { lower: true, remove: /[^a-zA-Z\d\s:]/g })
  const newSlug = getIteration(slug)
  usedTitles.push(newSlug)
  return newSlug
}

async function digestContent(
  languages: Language[],
  mediaComponent: MediaComponent
): Promise<void> {
  const video = await getVideo(mediaComponent.mediaComponentId)
  if (video?.permalink != null) usedTitles.push(video.permalink)

  const metadataLanguageId =
    languages
      .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
      ?.languageId.toString() ?? '529' // english by default

  console.log('content:', mediaComponent.mediaComponentId)

  const variants: VideoVariant[] = []
  for (const mediaComponentLanguage of await getMediaComponentLanguage(
    mediaComponent.mediaComponentId
  )) {
    variants.push(
      await digestMediaComponentLanguage(mediaComponentLanguage, mediaComponent)
    )
  }

  const body = {
    type: VideoType.standalone,
    primaryLanguageId: mediaComponent.primaryLanguageId.toString(),
    title: [
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
    studyQuestions: mediaComponent.studyQuestions.map((studyQuestion) => [
      {
        languageId: metadataLanguageId,
        value: studyQuestion,
        primary: true
      }
    ]),
    image: mediaComponent.imageUrls.mobileCinematicHigh,
    tagIds: [],
    episodeIds: [],
    variants,
    permalink: video?.permalink ?? getSeoTitle(mediaComponent.title)
  }

  if (video != null) {
    await db.collection('videos').update(mediaComponent.mediaComponentId, body)
  } else {
    await db
      .collection('videos')
      .save({ _key: mediaComponent.mediaComponentId, ...body })
  }
}

async function digestMediaComponentLanguage(
  mediaComponentLanguage: MediaComponentLanguage,
  mediaComponent: MediaComponent
): Promise<VideoVariant> {
  if (mediaComponent.subType === 'series') {
    return {
      id: mediaComponentLanguage.refId,
      languageId: mediaComponentLanguage.languageId.toString(),
      duration: Math.round(mediaComponentLanguage.lengthInMilliseconds * 0.001),
      subtitle: [],
      downloads: []
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
    downloads
  }
}

async function getMediaComponentLinks(
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

async function digestSeriesContainer(
  mediaComponent,
  languages,
  video
): Promise<Video> {
  if (video?.permalink != null) usedTitles.push(video.permalink)
  const metadataLanguageId =
    languages
      .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
      ?.languageId.toString() ?? '529' // english by default

  const variants: VideoVariant[] = []
  for (const mediaComponentLanguage of await getMediaComponentLanguage(
    mediaComponent.mediaComponentId
  )) {
    variants.push(
      await digestMediaComponentLanguage(mediaComponentLanguage, mediaComponent)
    )
  }

  return {
    _key: mediaComponent.mediaComponentId,
    type: VideoType.playlist,
    primaryLanguageId: mediaComponent.primaryLanguageId.toString(),
    title: [
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
    studyQuestions: mediaComponent.studyQuestions.map((studyQuestion) => [
      {
        languageId: metadataLanguageId,
        value: studyQuestion,
        primary: true
      }
    ]),
    image: mediaComponent.imageUrls.mobileCinematicHigh,
    tagIds: [],
    permalink: video?.permalink ?? getSeoTitle(mediaComponent.title),
    episodeIds: [],
    variants
  }
}

async function digestContainer(
  languages: Language[],
  mediaComponent: MediaComponent
): Promise<void> {
  console.log('container:', mediaComponent.mediaComponentId)
  let series, existingSeries
  if (mediaComponent.subType === 'series') {
    existingSeries = await getVideo(mediaComponent.mediaComponentId)
    series = await digestSeriesContainer(
      mediaComponent,
      languages,
      existingSeries
    )
  } else {
    const metadataLanguageId =
      languages
        .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
        ?.languageId.toString() ?? '529' // english by default
    tags[mediaComponent.mediaComponentId] = {
      _key: mediaComponent.mediaComponentId,
      title: [
        {
          value: mediaComponent.title,
          languageId: metadataLanguageId,
          primary: true
        }
      ]
    }
  }
  for (const videoId of await getMediaComponentLinks(
    mediaComponent.mediaComponentId
  )) {
    const video = await getVideo(videoId)
    if (video == null) continue

    if (mediaComponent.subType === 'series') series.episodeIds.push(videoId)

    if (video.tagIds.includes(mediaComponent.mediaComponentId)) continue

    if (mediaComponent.subType === 'series') {
      await db.collection('videos').update(videoId, {
        type: VideoType.episode
      })
    } else {
      await db.collection('videos').update(videoId, {
        tagIds: [...video.tagIds, mediaComponent.mediaComponentId]
      })
    }
  }
  if (mediaComponent.subType === 'series') {
    if (existingSeries != null)
      await db
        .collection('videos')
        .update(mediaComponent.mediaComponentId, series)
    else await db.collection('videos').save(series)
  }
}

async function getVideo(videoId: string): Promise<Video | undefined> {
  const rst = await db.query(aql`
  FOR item IN ${db.collection('videos')}
    FILTER item._key == ${videoId}
    LIMIT 1
    RETURN item`)
  return await rst.next()
}

async function main(): Promise<void> {
  try {
    await db.createCollection('videos', { keyOptions: { type: 'uuid' } })
  } catch {}
  try {
    await db.createCollection('videoTags', { keyOptions: { type: 'uuid' } })
  } catch {}

  await db.collection('videos').ensureIndex({
    name: 'language_id',
    type: 'persistent',
    fields: ['variants[*].languageId']
  })

  const view = {
    links: {
      videos: {
        fields: {
          tagIds: {
            analyzers: ['identity']
          },
          variants: {
            fields: {
              languageId: {
                analyzers: ['identity']
              },
              subtitle: {
                fields: {
                  languageId: {
                    analyzers: ['identity']
                  }
                }
              }
            }
          },
          title: {
            fields: {
              value: {
                analyzers: ['text_en']
              }
            }
          },
          type: {
            analyzers: ['identity']
          },
          episodeIds: {
            analyzers: ['identity']
          },
          permalink: {
            analyzers: ['identity']
          }
        }
      }
    }
  }
  if (await db.view('videosView').exists()) {
    console.log('updating view')
    await db.view('videosView').updateProperties(view)
  } else {
    console.log('creating view')
    await db.createView('videosView', view)
  }
  console.log('view created')

  const languages = await getLanguages()
  for (const content of await getMediaComponents('content')) {
    await digestContent(languages, content)
  }

  for (const container of await getMediaComponents('container')) {
    await digestContainer(languages, container)
  }

  await db.collection('videos').ensureIndex({
    name: 'permalink',
    type: 'persistent',
    fields: ['permalink'],
    unique: true
  })

  for (const key in tags) {
    await db.collection('videoTags').save(
      {
        _key: tags[key]._key,
        title: tags[key].title
      },
      { overwriteMode: 'update' }
    )
  }
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
