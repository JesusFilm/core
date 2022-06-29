import { aql } from 'arangojs'
import fetch from 'node-fetch'
import slugify from 'slugify'
import Crowdin, { Credentials } from '@crowdin/crowdin-api-client'
import { parse, ParseResult } from 'papaparse'
import { isEmpty, map } from 'lodash'

import { VideoType } from '../src/app/__generated__/graphql'
import { ArangoDB } from './db'

// crowdin credentials
const credentials: Credentials = {
  token: process.env.CROWDIN_API_KEY ?? ''
}

const { translationsApi } = new Crowdin(credentials)

const translationProjectId = 47654

// from listTranslationFiles
const translationIds = {
  collectionTitles: 31,
  collectionDescriptions: 33,
  titles: 34,
  longDescriptions: 35,
  // bibleBooks: 36,
  studyQuestions: 37
}

// hardcoded due to data inconsistencies. from getTranslationLanguages & languages collection
const languageIds = {
  en: '529',
  fr: '496',
  ar: '22658',
  de: '1106',
  he: '6930',
  it: '4415',
  ja: '7083',
  ko: '3804',
  ru: '3934',
  tr: '1942',
  'zh-CN': '21754', // zh-hans
  'zh-TW': '21753', // zh-hant
  'ur-PK': '407', // ur
  vi: '3887',
  'pt-BR': '584', // pt
  id: '16639',
  fa: '6788',
  'es-MX': '21028', // es
  th: '13169',
  hi: '6464'
  // no obvious value available for ne-NP
}

let languages,
  existingSlugsById: Array<{ _key: string; slugs: string[] }>,
  usedSlugs: string[]
const translations = {}

// Leaving commented code to find data later

// async function getTranslationLanguages(projectId): Promise<string[]> {
//   const response = await projectsGroupsApi.getProject(projectId)
//   return response?.data?.targetLanguageIds
// }

// async function listTranslationFiles() {
//   const result = await sourceFilesApi.listProjectFiles(translationProjectId)
//   console.log(result.data)
// }

// Download translations
async function downloadTranslations(
  projectId,
  fileId,
  language
): Promise<ParseResult<unknown>> {
  const downloadLink = await translationsApi.buildProjectFileTranslation(
    projectId,
    fileId,
    {
      targetLanguageId: language
    }
  )
  const response = await fetch(downloadLink.data.url)
  const translations = await response.text()
  const json = parse(translations, { header: true })
  return json
}

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
  seoTitle: Translation[]
  snippet: Translation[]
  description: Translation[]
  studyQuestions: Translation[][]
  image: string
  imageAlt: Translation[]
  variants: VideoVariant[]
  tagIds: string[]
  slug: Translation[]
  episodeIds: string[]
  noIndex: boolean
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

function getIteration(slug: string): string {
  const exists = usedSlugs.find((t) => t === slug)
  if (exists != null && slug !== '') {
    const regex = slug.match(/^(.*?)-(\d+)$/)
    const iteration = parseInt(regex?.[2] ?? '1') + 1
    const title = regex?.[1] ?? slug
    const value = `${title}-${iteration}`
    return getIteration(value)
  }
  return slug
}

function getSeoSlugs(
  _key: string,
  existingSlugs: Translation[] = [],
  titles: Translation[]
): Translation[] {
  titles.forEach((t) => {
    const slug = getSlug(t.value)
    const existing = existingSlugsById.find((s) => s._key === _key)
    if (existing?.slugs?.includes(slug) ?? false) return

    const newSlug = getNewSlug(t.value)
    if (isEmpty(newSlug)) return

    if (existing != null) existing.slugs.push(newSlug)
    else existingSlugsById.push({ _key: _key, slugs: [newSlug] })

    existingSlugs.push({
      value: newSlug,
      languageId: t.languageId,
      primary: t.primary
    })
  })
  return existingSlugs
}

function getSlug(title: string): string {
  return slugify(title, { lower: true, remove: /[^a-zA-Z\d\s:]/g })
}

function getNewSlug(title: string): string {
  const slug = getSlug(title)
  const newSlug = getIteration(slug)
  usedSlugs.push(newSlug)
  return newSlug
}

function getLanguageIdFromBcp(language: string): string {
  return (
    languages.find(({ bcp47 }) => bcp47 === language)?.languageId.toString() ??
    '529'
  )
}

function getTranslationFromObject(
  refField: string,
  refId: string,
  translationId: string,
  field: string
): Translation[] {
  const arr: Translation[] = []
  for (const language in languageIds) {
    if (language === 'en') continue

    const translation = translations[language]?.[translationId]?.find(
      (t) => t[refField] === refId
    )
    if (translation != null && !isEmpty(translation[field]))
      arr.push({
        value: translation[field],
        languageId: languageIds[language],
        primary: false
      })
  }
  return arr
}

function getTranslationForStudyQuestion(
  refId: string,
  english: string
): Translation[] {
  const arr: Translation[] = []
  for (const language in languageIds) {
    if (language === 'en') continue

    const translation = translations[language]?.studyQuestions?.find(
      (t) => t.media_component_id === refId && t.eng_study_question === english
    )
    if (translation != null && !isEmpty(translation.study_question))
      arr.push({
        value: translation.study_question,
        languageId: languageIds[language],
        primary: false
      })
  }
  return arr
}

async function digestContent(mediaComponent: MediaComponent): Promise<void> {
  const video = await getVideo(mediaComponent.mediaComponentId)

  const metadataLanguageId = getLanguageIdFromBcp(
    mediaComponent.metadataLanguageTag
  )

  console.log('content:', mediaComponent.mediaComponentId)

  const variants: VideoVariant[] = []
  for (const mediaComponentLanguage of await getMediaComponentLanguage(
    mediaComponent.mediaComponentId
  )) {
    variants.push(
      await digestMediaComponentLanguage(mediaComponentLanguage, mediaComponent)
    )
  }
  const translatedTitles = getTranslationFromObject(
    'eng_title',
    mediaComponent.title,
    'titles',
    'title'
  )

  const body = {
    type: VideoType.standalone,
    primaryLanguageId: mediaComponent.primaryLanguageId.toString(),
    title: [
      {
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles
    ],
    seoTitle: [
      {
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles
    ],
    snippet: [
      {
        value: mediaComponent.shortDescription,
        languageId: metadataLanguageId,
        primary: true
      },
      ...getTranslationFromObject(
        'eng_title',
        mediaComponent.title,
        'longDescriptions',
        'short_description'
      )
    ],
    description: [
      {
        value: mediaComponent.longDescription,
        languageId: metadataLanguageId,
        primary: true
      },
      ...getTranslationFromObject(
        'eng_title',
        mediaComponent.title,
        'longDescriptions',
        'long_description'
      )
    ],
    studyQuestions: mediaComponent.studyQuestions.map((studyQuestion) => [
      {
        languageId: metadataLanguageId,
        value: studyQuestion,
        primary: true
      },
      ...getTranslationForStudyQuestion(
        mediaComponent.mediaComponentId,
        studyQuestion
      )
    ]),
    image: mediaComponent.imageUrls.mobileCinematicHigh,
    imageAlt: [
      {
        value:
          mediaComponent.title.length <= 100
            ? mediaComponent.title
            : mediaComponent.title.substring(0, 99),
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles.map((t) => ({
        value: t.value.length <= 100 ? t.value : t.value.substring(0, 99),
        languageId: t.languageId,
        primary: t.primary
      }))
    ],
    tagIds: [],
    episodeIds: [],
    variants,
    slug: getSeoSlugs(mediaComponent.mediaComponentId, video?.slug, [
      {
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles
    ]),
    noIndex: false
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

async function digestSeriesContainer(mediaComponent, video): Promise<Video> {
  // if (video?.slug != null)
  //   video.slug.forEach((title) => usedTitles.push(title.value))
  const metadataLanguageId = getLanguageIdFromBcp(
    mediaComponent.metadataLanguageTag
  )

  const variants: VideoVariant[] = []
  for (const mediaComponentLanguage of await getMediaComponentLanguage(
    mediaComponent.mediaComponentId
  )) {
    variants.push(
      await digestMediaComponentLanguage(mediaComponentLanguage, mediaComponent)
    )
  }
  const translatedTitles = getTranslationFromObject(
    'eng_name',
    mediaComponent.title,
    'collectionTitles',
    'name'
  )

  return {
    _key: mediaComponent.mediaComponentId,
    type: VideoType.playlist,
    primaryLanguageId: mediaComponent.primaryLanguageId.toString(),
    title: [
      {
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles
    ],
    seoTitle: [
      {
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles
    ],
    snippet: [
      {
        value: mediaComponent.shortDescription,
        languageId: metadataLanguageId,
        primary: true
      },
      ...getTranslationFromObject(
        'eng_name',
        mediaComponent.title,
        'collectionDescriptions',
        'short_description'
      )
    ],
    description: [
      {
        value: mediaComponent.longDescription,
        languageId: metadataLanguageId,
        primary: true
      },
      ...getTranslationFromObject(
        'eng_name',
        mediaComponent.title,
        'collectionDescriptions',
        'long_description'
      )
    ],
    studyQuestions: mediaComponent.studyQuestions.map((studyQuestion) => [
      {
        languageId: metadataLanguageId,
        value: studyQuestion,
        primary: true
      },
      ...getTranslationForStudyQuestion(
        mediaComponent.mediaComponentId,
        studyQuestion
      )
    ]),
    image: mediaComponent.imageUrls.mobileCinematicHigh,
    imageAlt: [
      {
        value:
          mediaComponent.title.length <= 100
            ? mediaComponent.title
            : mediaComponent.title.substring(0, 99),
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles.map((t) => ({
        value: t.value.length <= 100 ? t.value : t.value.substring(0, 99),
        languageId: t.languageId,
        primary: t.primary
      }))
    ],
    tagIds: [],
    slug: getSeoSlugs(mediaComponent.mediaComponentId, video?.slug, [
      {
        value: mediaComponent.title,
        languageId: metadataLanguageId,
        primary: true
      },
      ...translatedTitles
    ]),
    episodeIds: [],
    variants,
    noIndex: false
  }
}

async function getExistingSlugs(): Promise<void> {
  const result = await db.query(aql`
  FOR v in videos
    RETURN { _key: v._key,  slugs: flatten(v.slug[*].value) }
  `)
  existingSlugsById = await result.all()
}

async function digestContainer(mediaComponent: MediaComponent): Promise<void> {
  console.log('container:', mediaComponent.mediaComponentId)
  let series, existingSeries
  if (mediaComponent.subType === 'series') {
    existingSeries = await getVideo(mediaComponent.mediaComponentId)
    series = await digestSeriesContainer(mediaComponent, existingSeries)
  } else {
    const metadataLanguageId = getLanguageIdFromBcp(
      mediaComponent.metadataLanguageTag
    )
    tags[mediaComponent.mediaComponentId] = {
      _key: mediaComponent.mediaComponentId,
      title: [
        {
          value: mediaComponent.title,
          languageId: metadataLanguageId,
          primary: true
        },
        ...getTranslationFromObject(
          'eng_name',
          mediaComponent.title,
          'collectionTitles',
          'name'
        )
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
  // await listTranslationFiles()
  for (const l in languageIds) {
    translations[l] = {}
    for (const key in translationIds) {
      try {
        console.log('translation:', `${key}: ${l}`)
        const result = await downloadTranslations(
          translationProjectId,
          translationIds[key],
          l
        )
        translations[l][key] = result?.data
      } catch {}
    }
  }
  // fs.writeFileSync('translations.json', JSON.stringify(translations))
  // console.log(translations)

  if (!(await db.collection('videos').exists())) {
    await db.createCollection('videos', { keyOptions: { type: 'uuid' } })
  }
  if (!(await db.collection('videoTags').exists())) {
    await db.createCollection('videoTags', { keyOptions: { type: 'uuid' } })
  }
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
          slug: {
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
  languages = await getLanguages()

  console.log('getting existing slugs')
  await getExistingSlugs()
  usedSlugs = map(existingSlugsById, 'slugs') as unknown as string[]

  for (const content of await getMediaComponents('content')) {
    await digestContent(content)
  }
  for (const container of await getMediaComponents('container')) {
    await digestContainer(container)
  }
  await db.collection('videos').ensureIndex({
    name: 'slug',
    type: 'persistent',
    fields: ['slug[*].value'],
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
