import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { algoliasearch } from 'algoliasearch'
import { Logger } from 'pino'

import { graphql } from '../../../lib/graphql/gatewayGraphql'
import { prisma } from '../../../lib/prisma'

import { LANGUAGES_TO_INCLUDE } from './languages'

export const GET_LANGUAGES = graphql(`
  query getLanguages {
    languages {
      id
      bcp47
      name(languageId: "529", primary: true) {
        value
        primary
        language {
          id
        }
      }
    }
  }
`)

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'x-graphql-client-name': 'api-media',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

export const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

interface LanguageRecord {
  [key: string]: {
    english: string | undefined
    primary: string | undefined
    bcp47: string | undefined
  }
}

async function getLanguages(logger?: Logger): Promise<LanguageRecord> {
  try {
    const { data } = await apollo.query({
      query: GET_LANGUAGES
    })

    const languagesRecord: LanguageRecord = {}
    data.languages.forEach((language) => {
      languagesRecord[language.id] = {
        english: language.name.find(({ language }) => language.id === '529')
          ?.value,
        primary: language.name.find(({ primary }) => primary)?.value,
        bcp47: language.bcp47 ?? undefined
      }
    })

    return languagesRecord
  } catch (error) {
    logger?.error(error, 'unable to get languages from gateway')
    return {}
  }
}

type Translation = {
  languageId: string
  value: string
}

function sortByEnglishFirst(a: Translation, b: Translation): number {
  if (a.languageId === '529') return -1
  return 0
}

export async function service(logger?: Logger): Promise<void> {
  const apiKey = process.env.ALGOLIA_API_KEY ?? ''
  const appId = process.env.ALGOLIA_APPLICATION_ID ?? ''
  const videoVariantsIndex = process.env.ALGOLIA_INDEX_VIDEO_VARIANTS ?? ''
  const videosIndex = process.env.ALGOLIA_INDEX_VIDEOS ?? ''

  if (
    apiKey === '' ||
    appId === '' ||
    videoVariantsIndex === '' ||
    videosIndex === ''
  )
    throw new Error('algolia environment variables not set')

  const languages = await getLanguages(logger)
  const client = algoliasearch(appId, apiKey)

  let offset = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const videoVariants = await prisma.videoVariant.findMany({
        take: 1000,
        skip: offset,
        include: {
          video: {
            include: {
              title: true,
              description: true,
              imageAlt: true,
              snippet: true,
              subtitles: true,
              images: true
            }
          }
        },
        where:
          videoVariantsIndex === 'video-variants-prd'
            ? undefined
            : {
                languageId: {
                  in: LANGUAGES_TO_INCLUDE
                }
              }
      })

      if (videoVariants.length === 0) {
        break
      }

      const transformedVideos = videoVariants.map((videoVariant) => {
        const cfImage = videoVariant.video?.images.find(
          ({ aspectRatio }) => aspectRatio === 'banner'
        )
        let image = ''
        if (cfImage != null)
          image = `https://imagedelivery.net/${
            process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
          }/${cfImage.id}/f=jpg,w=1280,h=600,q=95`

        return {
          objectID: videoVariant.id,
          videoId: videoVariant.videoId,
          titles: videoVariant.video?.title
            .sort(sortByEnglishFirst)
            .map((title) => title?.value),
          description: videoVariant.video?.description
            ?.sort(sortByEnglishFirst)
            .map((description) => description?.value),
          duration: videoVariant.duration,
          languageId: videoVariant.languageId,
          languageEnglishName: languages[videoVariant.languageId]?.english,
          languagePrimaryName: languages[videoVariant.languageId]?.primary,
          subtitles: videoVariant.video?.subtitles
            .filter((subtitle) => subtitle.edition === videoVariant.edition)
            .map((subtitle) => subtitle.languageId),
          slug: videoVariant.slug,
          label: videoVariant.video?.label,
          image,
          imageAlt:
            videoVariant.video?.imageAlt.find((alt) => alt.languageId === '529')
              ?.value ?? '',
          childrenCount: videoVariant.video?.childIds.length,
          manualRanking: videoVariant.languageId === '529' ? 0 : 1
        }
      })

      try {
        await client.saveObjects({
          indexName: videoVariantsIndex,
          objects: transformedVideos,
          waitForTasks: true
        })
        logger?.info(`exported ${offset} videos to algolia`)
      } catch (error) {
        logger?.error(error, 'unable to export videos to algolia')
      }

      offset += 1000
    } catch (error) {
      logger?.error(error, 'unable to complete video processing loop')
      break
    }
  }
  await indexVideos(client, languages, videosIndex, logger)
}

async function indexVideos(
  client: ReturnType<typeof algoliasearch>,
  languages: LanguageRecord,
  videosIndex: string,
  logger?: Logger
): Promise<void> {
  try {
    const videos = await prisma.video.findMany({
      include: {
        title: true,
        description: true,
        imageAlt: true,
        snippet: true,
        subtitles: true,
        images: true,
        studyQuestions: true,
        bibleCitation: true,
        keywords: true,
        variants: {
          include: {
            downloads: true
          }
        }
      }
    })

    const transformedVideos = videos.map((video) => {
      const isDownloadable =
        video.label === 'collection' || video.label === 'series'
          ? false
          : (video.variants[0]?.downloadable ?? false)

      const titles = video.title.map((title) => ({
        value: title.value,
        languageId: title.languageId,
        bcp47: languages[title.languageId]?.bcp47 ?? ''
      }))

      const descriptions = video.description.map((description) => ({
        value: description.value,
        languageId: description.languageId,
        bcp47: languages[description.languageId]?.bcp47 ?? ''
      }))

      // Group study questions by language
      const studyQuestionsByLanguage = video.studyQuestions.reduce(
        (acc, question) => {
          const bcp47 = languages[question.languageId]?.bcp47 ?? ''
          if (!acc[question.languageId]) {
            acc[question.languageId] = {
              value: [],
              languageId: question.languageId,
              bcp47
            }
          }
          acc[question.languageId].value.push(question.value)
          return acc
        },
        {} as Record<
          string,
          { value: string[]; languageId: string; bcp47: string }
        >
      )

      // Transform bible citations
      const bibleCitations =
        video.bibleCitation?.map((citation) => ({
          osisBibleBook: citation.osisId,
          chapterStart: citation.chapterStart,
          verseStart: citation.verseStart,
          chapterEnd: citation.chapterEnd ?? null,
          verseEnd: citation.verseEnd ?? null
        })) ?? []

      // Find images by aspect ratio
      const bannerImage = video.images.find(
        (image) => image.aspectRatio === 'banner'
      )
      const hdImage = video.images.find((image) => image.aspectRatio === 'hd')

      // Construct image URLs
      const imageUrls = {
        thumbnail: hdImage
          ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'}/${hdImage.id}/f=jpg,w=120,h=68,q=95`
          : null,
        videoStill: hdImage
          ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'}/${hdImage.id}/f=jpg,w=1920,h=1080,q=95`
          : null,
        mobileCinematicHigh: bannerImage
          ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'}/${bannerImage.id}/f=jpg,w=1280,h=600,q=95`
          : null,
        mobileCinematicLow: bannerImage
          ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'}/${bannerImage.id}/f=jpg,w=640,h=300,q=95`
          : null,
        mobileCinematicVeryLow: bannerImage
          ? `https://imagedelivery.net/${process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'}/${bannerImage.id}/f=webp,w=640,h=300,q=50`
          : null
      }

      return {
        objectID: video.id,
        mediaComponentId: video.id,
        componentType: video.variants[0]?.hls != null ? 'content' : 'container',
        subType: video.label,
        contentType: video.variants[0]?.hls != null ? 'video' : 'none',
        lengthInMilliseconds: video.variants[0]?.lengthInMilliseconds ?? 0,
        titles,
        descriptions,
        studyQuestions: Object.values(studyQuestionsByLanguage),
        keywords: video.keywords.map((keyword) => keyword.value),
        isDownloadable,
        downloadSizes: isDownloadable
          ? {
              approximateSmallDownloadSizeInBytes:
                video.variants[0]?.downloads?.find(
                  ({ quality }) => quality === 'low'
                )?.size ?? 0,
              approximateLargeDownloadSizeInBytes:
                video.variants[0]?.downloads?.find(
                  ({ quality }) => quality === 'high'
                )?.size ?? 0
            }
          : {},
        primaryLanguageId: Number(video.primaryLanguageId),
        bibleCitations,
        containsCount: video.childIds?.length ?? 0,
        imageUrls
      }
    })

    try {
      await client.saveObjects({
        indexName: videosIndex,
        objects: transformedVideos,
        waitForTasks: true
      })
      logger?.info(`indexed ${transformedVideos.length} videos to algolia`)
    } catch (error) {
      logger?.error(error, 'unable to export video records to algolia')
    }
  } catch (error) {
    logger?.error(error, 'unable to complete video processing loop')
  }
}
