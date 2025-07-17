import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { algoliasearch } from 'algoliasearch'
import { Logger } from 'pino'

import { graphql } from '@core/shared/gql'

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

// Remove global Apollo client - create it per function call instead
function createApolloClient(): ApolloClient<any> {
  const httpLink = createHttpLink({
    uri: process.env.GATEWAY_URL,
    headers: {
      'x-graphql-client-name': 'api-media',
      'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
    }
  })

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache'
      },
      query: {
        fetchPolicy: 'no-cache'
      }
    }
  })
}

interface LanguageRecord {
  [key: string]: {
    english: string | undefined
    primary: string | undefined
    bcp47: string | undefined
  }
}

async function getLanguages(logger?: Logger): Promise<LanguageRecord> {
  let apollo: ApolloClient<any> | null = null

  try {
    apollo = createApolloClient()

    const { data } = await apollo.query({
      query: GET_LANGUAGES,
      fetchPolicy: 'no-cache'
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
  } finally {
    // Clean up Apollo client resources
    if (apollo) {
      void apollo.clearStore()
      void apollo.cache.reset()
      void apollo.stop()
    }
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

// Force garbage collection if available (for Node.js environments)
function forceGarbageCollection(): void {
  if (global.gc) {
    global.gc()
  }
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
  const batchSize = 1000

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const videoVariants = await prisma.videoVariant.findMany({
        take: batchSize,
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

      if (logger && offset % 1000 === 0) {
        const used = process.memoryUsage()
        logger.info(
          {
            offset,
            memory: {
              heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
              heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
              rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
              external: `${Math.round(used.external / 1024 / 1024)} MB`
            }
          },
          'Memory usage during video variant processing'
        )
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

        const sortedTitles =
          videoVariant.video?.title.sort(sortByEnglishFirst) ?? []

        return {
          objectID: videoVariant.id,
          videoId: videoVariant.videoId,
          titles: sortedTitles.map((title) => title?.value),
          titlesWithLanguages: sortedTitles.map((title) => ({
            value: title?.value ?? '',
            languageId: title?.languageId ?? ''
            // bcp47: languages[title.languageId]?.bcp47 ?? ''
          })),
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

        if (logger) {
          const used = process.memoryUsage()
          logger.info(
            {
              batchSize: transformedVideos.length,
              memory: {
                heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
                rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
                external: `${Math.round(used.external / 1024 / 1024)} MB`
              }
            },
            'Memory usage after Algolia batch upload'
          )
        }

        logger?.info(
          `exported ${offset + videoVariants.length} videos to algolia`
        )
      } catch (error) {
        logger?.error(error, 'unable to export videos to algolia')
      }

      offset += batchSize

      // Force garbage collection every 10 batches to prevent memory buildup
      if (offset % (batchSize * 10) === 0) {
        forceGarbageCollection()
        logger?.info(
          `processed ${offset} video variants, forcing garbage collection`
        )
      }
    } catch (error) {
      logger?.error(error, 'unable to complete video processing loop')
      break
    }
  }

  await indexVideos(client, languages, videosIndex, logger)

  // Final cleanup
  forceGarbageCollection()
}

async function indexVideos(
  client: ReturnType<typeof algoliasearch>,
  languages: LanguageRecord,
  videosIndex: string,
  logger?: Logger
): Promise<void> {
  try {
    // Get total count first to implement pagination
    const totalCount = await prisma.video.count()
    const batchSize = 100 // Smaller batch size for videos due to larger objects
    let offset = 0

    logger?.info(`indexing ${totalCount} videos in batches of ${batchSize}`)

    while (offset < totalCount) {
      const videos = await prisma.video.findMany({
        take: batchSize,
        skip: offset,
        select: {
          id: true,
          label: true,
          primaryLanguageId: true,
          childIds: true,
          title: {
            select: {
              value: true,
              languageId: true
            }
          },
          description: {
            select: {
              value: true,
              languageId: true
            }
          },
          studyQuestions: {
            select: {
              value: true,
              languageId: true
            }
          },
          bibleCitation: {
            select: {
              osisId: true,
              chapterStart: true,
              verseStart: true,
              chapterEnd: true,
              verseEnd: true
            }
          },
          keywords: {
            select: {
              value: true
            }
          },
          images: {
            select: {
              id: true,
              aspectRatio: true
            },
            where: {
              aspectRatio: {
                in: ['banner', 'hd']
              }
            }
          },
          variants: {
            select: {
              hls: true,
              lengthInMilliseconds: true,
              downloadable: true,
              downloads: {
                select: {
                  quality: true,
                  size: true
                },
                where: {
                  quality: {
                    in: ['low', 'high']
                  }
                }
              }
            },
            where: {
              languageId: '529'
            },
            take: 1
          }
        }
      })

      if (videos.length === 0) {
        break
      }

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
          componentType:
            video.variants[0]?.hls != null ? 'content' : 'container',
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
        logger?.info(
          `indexed batch ${Math.floor(offset / batchSize) + 1}: ${transformedVideos.length} videos to algolia`
        )
      } catch (error) {
        logger?.error(error, 'unable to export video records to algolia')
      }

      offset += batchSize

      // Force garbage collection every 5 batches for video indexing
      if (offset % (batchSize * 5) === 0) {
        forceGarbageCollection()
        logger?.info(`processed ${offset} videos, forcing garbage collection`)
      }
    }

    logger?.info(`completed indexing ${totalCount} videos to algolia`)
  } catch (error) {
    logger?.error(error, 'unable to complete video processing loop')
  }
}
