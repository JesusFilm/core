import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { getAlgoliaClient } from '../algoliaClient'

export async function checkVideoInAlgolia(
  videoId: string,
  logger?: Logger
): Promise<boolean> {
  const client = await getAlgoliaClient(logger)
  const videosIndex = process.env.ALGOLIA_INDEX_VIDEOS ?? ''

  if (client == null) {
    logger?.warn('algolia client not found, cannot check video')
    return false
  }

  try {
    await client.getObject({
      indexName: videosIndex,
      objectID: videoId
    })

    console.log('Video found in Algolia index')
    logger?.info(`Video ${videoId} found in Algolia index ${videosIndex}`)
    return true
  } catch (error) {
    logger?.error(error, `failed to check video ${videoId} in algolia`)
    console.error('Video not found in Algolia index', error)
    console.log('Video not found in Algolia index', error)
    logger?.info(`Video ${videoId} not found in Algolia index ${videosIndex}`)
    return false
  }
}

export async function checkVideoVariantsInAlgolia(
  videoId: string,
  logger?: Logger
): Promise<string[]> {
  const client = await getAlgoliaClient(logger)
  const videoVariantsIndex = process.env.ALGOLIA_INDEX_VIDEO_VARIANTS ?? ''

  if (client == null) {
    logger?.warn('algolia client not found, cannot check video variants')
    return []
  }

  try {
    // Get all variants for this video from database
    const variants = await prisma.videoVariant.findMany({
      where: { videoId },
      select: { id: true }
    })

    const foundVariants: string[] = []

    // Check each variant in Algolia
    for (const variant of variants) {
      try {
        await client.getObject({
          indexName: videoVariantsIndex,
          objectID: variant.id
        })
        foundVariants.push(variant.id)
        logger?.info(
          `Video variant ${variant.id} found in Algolia index ${videoVariantsIndex}`
        )
      } catch {
        logger?.info(
          `Video variant ${variant.id} not found in Algolia index ${videoVariantsIndex}`
        )
        // Variant not found in Algolia, skip
      }
    }

    return foundVariants
  } catch (error) {
    logger?.error(
      error,
      `failed to check video variants for ${videoId} in algolia`
    )
    return []
  }
}
