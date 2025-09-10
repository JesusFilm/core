import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { getAlgoliaClient } from '../algoliaClient'
import { getLanguages } from '../languages'

function sortByEnglishFirst(a: { languageId: string }): number {
  if (a.languageId === '529') return -1
  return 0
}

export async function updateVideoVariantInAlgolia(
  videoVariantId: string,
  logger?: Logger
): Promise<void> {
  try {
    const client = await getAlgoliaClient(logger)
    const languages = await getLanguages(logger)
    const videoVariantsIndex = process.env.ALGOLIA_INDEX_VIDEO_VARIANTS ?? ''

    if (client == null) {
      logger?.warn('algolia client not found, skipping update')
      return
    }

    const videoVariant = await prisma.videoVariant.findUnique({
      where: { id: videoVariantId },
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
      }
    })

    if (videoVariant == null) {
      logger?.warn(`video variant ${videoVariantId} not found`)
      await client.deleteObject({
        indexName: videoVariantsIndex,
        objectID: videoVariantId
      })
      return
    }

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

    const transformedVideo = {
      objectID: videoVariant.id,
      videoId: videoVariant.videoId,
      titles: sortedTitles.map((title) => title?.value),
      titlesWithLanguages: sortedTitles.map((title) => ({
        value: title?.value ?? '',
        languageId: title?.languageId ?? ''
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
      videoPublished: videoVariant.video?.published ?? false,
      published: videoVariant.published ?? true,
      restrictViewPlatforms: videoVariant.video?.restrictViewPlatforms ?? [],
      manualRanking: videoVariant.languageId === '529' ? 0 : 1
    }

    const result = await client.saveObjects({
      indexName: videoVariantsIndex,
      objects: [transformedVideo],
      waitForTasks: true
    })

    logger?.info(
      `Successfully saved to Algolia. Tasks: ${result.map((r) => r.taskID).join(', ')}`
    )
    logger?.info(
      `Record ${videoVariant.id} is now available in index ${videoVariantsIndex}`
    )
  } catch (error) {
    logger?.error(
      error,
      `failed to update video variant ${videoVariantId} in algolia`
    )
  }
}
