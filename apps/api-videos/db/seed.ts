import { aql } from 'arangojs'
import fetch from 'node-fetch'
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
  subtitle: Translation[]
  hls: string
  languageId: string
  duration: number
  downloads: Download[]
}

interface Video {
  title: Translation[]
  snippet: Translation[]
  description: Translation[]
  studyQuestions: Translation[][]
  image: string
  variants: VideoVariant[]
  tagIds: string[]
}

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
      `https://api.arclight.org/v2/media-components/${mediaComponentId}/languages?apiKey=${
        process.env.ARCLIGHT_API_KEY ?? ''
      }`
    )
  ).json()
  return response._embedded.mediaComponentLanguage
}

async function digestContent(
  languages: Language[],
  mediaComponent: MediaComponent
): Promise<void> {
  const metadataLanguageId =
    languages
      .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
      ?.languageId.toString() ?? '529' // english by default

  console.log('content:', mediaComponent.mediaComponentId)

  const variants: VideoVariant[] = []
  for (const mediaComponentLanguage of await getMediaComponentLanguage(
    mediaComponent.mediaComponentId
  )) {
    variants.push(await digestMediaComponentLanguage(mediaComponentLanguage))
  }

  const body = {
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
    variants
  }

  const video = await getVideo(mediaComponent.mediaComponentId)
  if (video != null) {
    await db.collection('videos').update(mediaComponent.mediaComponentId, body)
  } else {
    await db
      .collection('videos')
      .save({ _key: mediaComponent.mediaComponentId, ...body })
  }
}

async function digestMediaComponentLanguage(
  mediaComponentLanguage: MediaComponentLanguage
): Promise<VideoVariant> {
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

async function digestContainer(
  languages: Language[],
  mediaComponent: MediaComponent
): Promise<void> {
  console.log('container:', mediaComponent.mediaComponentId)
  for (const videoId of await getMediaComponentLinks(
    mediaComponent.mediaComponentId
  )) {
    const video = await getVideo(videoId)
    if (video == null) continue

    if (video.tagIds.includes(mediaComponent.mediaComponentId)) continue
    await db.collection('videos').update(videoId, {
      tagIds: [...video.tagIds, mediaComponent.mediaComponentId]
    })
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
  await db.collection('videos').ensureIndex({
    type: 'persistent',
    fields: ['variants[*].languageId']
  })
  if (!(await db.view('videosView').exists())) {
    await db.createView('videosView', {
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
            }
          }
        }
      }
    })
  }

  const languages = await getLanguages()
  for (const content of await getMediaComponents('content')) {
    await digestContent(languages, content)
  }

  for (const container of await getMediaComponents('container')) {
    await digestContainer(languages, container)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
