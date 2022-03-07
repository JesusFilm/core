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

async function getMediaComponents(): Promise<MediaComponent[]> {
  const response: {
    _embedded: { mediaComponents: MediaComponent[] }
  } = await (
    await fetch(
      `https://api.arclight.org/v2/media-components?limit=5000&isDeprecated=false&type=content&contentTypes=video&apiKey=${
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

async function digestMediaComponent(
  languages: Language[],
  mediaComponent: MediaComponent
): Promise<void> {
  const metadataLanguageId = languages
    .find(({ bcp47 }) => bcp47 === mediaComponent.metadataLanguageTag)
    ?.languageId.toString()

  console.log('mediaComponent:', mediaComponent.mediaComponentId)

  for (const mediaComponentLanguage of await getMediaComponentLanguage(
    mediaComponent.mediaComponentId
  )) {
    await digestMediaComponentLanguage(
      {
        ...mediaComponent,
        metadataLanguageId: metadataLanguageId ?? '529' // english by default
      },
      mediaComponentLanguage
    )
  }
}

async function digestMediaComponentLanguage(
  mediaComponent: MediaComponent & { metadataLanguageId: string },
  mediaComponentLanguage: MediaComponentLanguage
): Promise<void> {
  const downloads: Array<{ quality: string; size: number; url: string }> = []
  for (const [key, value] of Object.entries(
    mediaComponentLanguage.downloadUrls
  )) {
    downloads.push({
      quality: key,
      size: value.sizeInBytes,
      url: value.url
    })
  }
  const body = {
    title: [
      {
        value: mediaComponent.title,
        languageId: mediaComponent.metadataLanguageId,
        primary: true
      }
    ],
    snippet: [
      {
        value: mediaComponent.shortDescription,
        languageId: mediaComponent.metadataLanguageId,
        primary: true
      }
    ],
    description: [
      {
        value: mediaComponent.longDescription,
        languageId: mediaComponent.metadataLanguageId,
        primary: true
      }
    ],
    subtitles:
      mediaComponentLanguage.subtitleUrls.vtt?.map(({ languageId, url }) => ({
        languageId: languageId.toString(),
        value: url,
        primary: languageId === mediaComponentLanguage.languageId
      })) ?? [],
    hls: mediaComponentLanguage.streamingUrls.hls[0].url,
    languageId: mediaComponentLanguage.languageId.toString(),
    duration: Math.round(mediaComponentLanguage.lengthInMilliseconds * 0.001),
    image: mediaComponent.imageUrls.mobileCinematicHigh,
    downloads
  }
  console.log('mediaComponentLanguage:', mediaComponentLanguage.refId)
  const video = await getVideo(mediaComponentLanguage.refId)
  if (video != null) {
    await db.collection('videos').update(mediaComponentLanguage.refId, body)
  } else {
    await db
      .collection('videos')
      .save({ _key: mediaComponentLanguage.refId, ...body })
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
    fields: ['languageId']
  })
  await db.collection('videos').ensureIndex({
    type: 'fulltext',
    fields: ['title']
  })

  const languages = await getLanguages()
  for (const mediaComponent of await getMediaComponents()) {
    await digestMediaComponent(languages, mediaComponent)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
