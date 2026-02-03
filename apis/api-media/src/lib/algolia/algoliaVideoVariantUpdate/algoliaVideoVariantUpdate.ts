import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { getAlgoliaClient, getAlgoliaConfig } from '../algoliaClient'
import { getLanguages } from '../languages'

function sortByEnglishFirst(
  a: { languageId?: string },
  b: { languageId?: string }
): number {
  const aIsEn = a?.languageId === '529'
  const bIsEn = b?.languageId === '529'
  return aIsEn === bIsEn ? 0 : aIsEn ? -1 : 1
}

export async function updateVideoVariantInAlgolia(
  videoVariantId: string,
  logger?: Logger
): Promise<void> {
  try {
    const client = getAlgoliaClient()
    const algoliaConfig = getAlgoliaConfig()
    const languages = await getLanguages(logger)

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
        indexName: algoliaConfig.videoVariantsIndex,
        objectID: videoVariantId
      })
      return
    }

    const imageAccount = process.env.CLOUDFLARE_IMAGE_ACCOUNT
    const isValidImageAccount =
      imageAccount != null &&
      imageAccount !== '' &&
      imageAccount !== 'testAccount'
    if (!isValidImageAccount) {
      logger?.warn(
        `CLOUDFLARE_IMAGE_ACCOUNT is missing or invalid ("${imageAccount}"). Skipping Algolia update for ${videoVariantId} to avoid polluting prod.`
      )
      return
    }

    const cfImage = videoVariant.video?.images.find(
      ({ aspectRatio }) => aspectRatio === 'banner'
    )
    let image = ''
    if (cfImage != null) {
      const version = videoVariant.version ?? 1
      image = `https://imagedelivery.net/${imageAccount}/${cfImage.id}/f=jpg,w=1280,h=600,q=95?v=${version}`
    }

    const sortedTitles = [...(videoVariant.video?.title ?? [])].sort(
      sortByEnglishFirst
    )

    const sortedDescription = [...(videoVariant.video?.description ?? [])].sort(
      sortByEnglishFirst
    )

    const transformedVideo = {
      objectID: videoVariant.id,
      videoId: videoVariant.videoId,
      titles: sortedTitles.map((title) => title?.value),
      titlesWithLanguages: sortedTitles.map((title) => ({
        value: title?.value ?? '',
        languageId: title?.languageId ?? ''
      })),
      description: sortedDescription.map((d) => d?.value),
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
      childrenCount: videoVariant.video?.childIds.length ?? 0,
      videoPublished: videoVariant.video?.published ?? false,
      published: videoVariant.published ?? false,
      restrictViewPlatforms: videoVariant.video?.restrictViewPlatforms ?? [],
      manualRanking: videoVariant.languageId === '529' ? 0 : 1
    }

    const result = await client.saveObjects({
      indexName: algoliaConfig.videoVariantsIndex,
      objects: [transformedVideo],
      waitForTasks: true
    })

    logger?.info(
      `Successfully saved to Algolia. Tasks: ${result.map((r) => r.taskID).join(', ')}`
    )
    logger?.info(
      `Record ${videoVariant.id} is now available in index ${algoliaConfig.videoVariantsIndex}`
    )
  } catch (error) {
    logger?.error(
      error,
      `failed to update video variant ${videoVariantId} in algolia`
    )
  }
}
