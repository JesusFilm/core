import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { getAlgoliaClient, getAlgoliaConfig } from '../algoliaClient'
import {
  hasAlgoliaPlayableMedia,
  isAlgoliaVideoDownloadable
} from '../isAlgoliaVideoDownloadable/isAlgoliaVideoDownloadable'
import { getLanguages } from '../languages'

export async function updateVideoInAlgolia(
  videoId: string,
  logger?: Logger
): Promise<void> {
  try {
    const client = getAlgoliaClient()
    const algoliaConfig = getAlgoliaConfig()
    const languages = await getLanguages(logger)

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        label: true,
        primaryLanguageId: true,
        childIds: true,
        published: true,
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
        availableLanguages: true,
        restrictDownloadPlatforms: true,
        restrictViewPlatforms: true,
        variants: {
          select: {
            id: true,
            hls: true,
            dash: true,
            lengthInMilliseconds: true,
            downloadable: true,
            // Unfiltered: isAlgoliaVideoDownloadable needs to see every
            // download row, not just low/high, since a variant whose lowest
            // static rendition is already >=1080p has no low/high row at
            // all. The downloadSizes lookups below still pick out low/high
            // specifically.
            downloads: {
              select: {
                quality: true,
                size: true
              }
            }
          },
          // Published English variant only, matching the arclight detail and
          // list routes, so the indexed record never reflects an unpublished
          // variant.
          where: {
            languageId: '529',
            published: true
          },
          take: 1
        }
      }
    })

    if (video == null) {
      logger?.warn(`video ${videoId} not found, removing from algolia`)
      // deleteObjects(waitForTasks) rather than deleteObject, so the job only
      // completes once Algolia has actually applied the removal — a
      // fire-and-forget accept would let a failed delete look like success and
      // skip the retry. Matches the waitForTasks writes above.
      await client.deleteObjects({
        indexName: algoliaConfig.videosIndex,
        objectIDs: [videoId],
        waitForTasks: true
      })
      return
    }

    logger?.info(
      `Found video: ${video.label} with ${video.variants.length} variants`
    )

    const isDownloadable = isAlgoliaVideoDownloadable(video.variants[0])
    const isVideoContent = hasAlgoliaPlayableMedia(video.variants[0])

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

    const transformedVideo = {
      objectID: video.id,
      mediaComponentId: video.id,
      componentType: isVideoContent ? 'content' : 'container',
      subType: video.label,
      contentType: isVideoContent ? 'video' : 'none',
      lengthInMilliseconds: video.variants[0]?.lengthInMilliseconds ?? 0,
      titles,
      descriptions,
      studyQuestions: Object.values(studyQuestionsByLanguage),
      keywords: video.keywords.map((keyword) => keyword.value),
      isDownloadable,
      restrictViewPlatforms: video.restrictViewPlatforms,
      hasAvailableLanguages: video.availableLanguages.length > 0,
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
      published: video.published ?? false
    }

    const result = await client.saveObjects({
      indexName: algoliaConfig.videosIndex,
      objects: [transformedVideo],
      waitForTasks: true
    })

    logger?.info(
      `Successfully saved to Algolia. Tasks: ${result.map((r) => r.taskID).join(', ')}`
    )
    logger?.info(
      `Record ${video.id} is now available in index ${algoliaConfig.videosIndex}`
    )
  } catch (error) {
    logger?.error(error, `failed to update video ${videoId} in algolia`)
    throw error
  }
}

export async function updateVideoPublishedStatus(
  videoId: string,
  publishedStatus: boolean,
  logger?: Logger
): Promise<void> {
  try {
    const client = getAlgoliaClient()
    const videoVariantsIndex = process.env.ALGOLIA_INDEX_VIDEO_VARIANTS ?? ''

    if (!videoVariantsIndex) {
      logger?.warn(
        'algolia client or index not found, skipping video published status update'
      )
      return
    }

    const allVariants = await prisma.videoVariant.findMany({
      where: { videoId },
      select: { id: true }
    })

    if (allVariants.length > 0) {
      const variantUpdates = allVariants.map((variant) => ({
        objectID: variant.id,
        videoPublished: publishedStatus
      }))

      await client.partialUpdateObjects({
        indexName: videoVariantsIndex,
        objects: variantUpdates,
        waitForTasks: true
      })

      logger?.info(
        `Updated ${allVariants.length} video variants to set videoPublished=${publishedStatus} for video ${videoId}`
      )
    }
  } catch (error) {
    logger?.error(
      error,
      `failed to update video published status for video ${videoId}`
    )
    throw error
  }
}
