import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { getAlgoliaClient } from '../algoliaClient'
import { getLanguages } from '../languages'

export async function updateVideoInAlgolia(
  videoId: string,
  logger?: Logger
): Promise<void> {
  const client = await getAlgoliaClient(logger)
  const languages = await getLanguages(logger)
  const videosIndex = process.env.ALGOLIA_INDEX_VIDEOS ?? ''

  if (client == null) {
    logger?.warn('algolia client not found, skipping update')
    return
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
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
        restrictDownloadPlatforms: true,
        restrictViewPlatforms: true,
        variants: {
          select: {
            published: true,
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

    if (video == null) {
      logger?.warn(`video ${videoId} not found`)
      return
    }

    logger?.info(
      `Found video: ${video.label} with ${video.variants.length} variants`
    )

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

    const published = video.variants[0]?.published ?? false

    const restrictViewArclight =
      video.restrictViewPlatforms.includes('arclight')

    const transformedVideo = {
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
      restrictViewArclight,
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
      imageUrls,
      published
    }

    const result = await client.saveObjects({
      indexName: videosIndex,
      objects: [transformedVideo],
      waitForTasks: true
    })

    logger?.info(
      `Successfully saved to Algolia. Tasks: ${result.map((r) => r.taskID).join(', ')}`
    )
    logger?.info(`Record ${video.id} is now available in index ${videosIndex}`)
  } catch (error) {
    logger?.error(error, `failed to update video ${videoId} in algolia`)
  }
}
