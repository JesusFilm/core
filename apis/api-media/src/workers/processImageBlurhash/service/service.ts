import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { generateBlurhash } from '../utils/generateBlurhash'

const BATCH_SIZE = 50

export interface ProcessImageBlurhashJobData {
  imageId?: string
}

export async function service(
  logger?: Logger,
  job?: Job<ProcessImageBlurhashJobData>
): Promise<void> {
  const { imageId } = job?.data ?? { imageId: undefined }

  if (imageId != null) {
    await processSingleImage(imageId, logger)
    return
  }

  await processBatch(logger)
}

async function processSingleImage(
  imageId: string,
  logger?: Logger
): Promise<void> {
  logger?.info({ imageId }, 'Processing single image blurhash')

  const image = await prisma.cloudflareImage.findUnique({
    where: { id: imageId },
    select: { id: true, uploaded: true, blurhash: true }
  })

  if (!image) {
    logger?.warn({ imageId }, 'Image not found')
    return
  }

  if (!image.uploaded) {
    logger?.warn({ imageId }, 'Image not uploaded yet')
    return
  }

  if (image.blurhash != null) {
    logger?.info({ imageId }, 'Image already has blurhash')
    return
  }

  try {
    if (await generateAndSaveBlurhash(imageId)) {
      logger?.info({ imageId }, 'Successfully generated blurhash')
    } else {
      logger?.warn({ imageId }, 'Failed to generate blurhash')
    }
  } catch (error) {
    logger?.error({ imageId, error }, 'Error processing image blurhash')
  }
}

async function processBatch(logger?: Logger): Promise<void> {
  let processed = 0
  let failed = 0

  while (true) {
    const images = await prisma.cloudflareImage.findMany({
      where: {
        blurhash: null,
        uploaded: true,
        OR: [
          { blurhashAttemptedAt: null },
          {
            blurhashAttemptedAt: {
              lt: new Date(Date.now() - 1000 * 60 * 60 * 24)
            }
          }
        ]
      },
      take: BATCH_SIZE,
      select: {
        id: true
      }
    })

    if (images.length === 0) {
      break
    }

    logger?.info({ batchSize: images.length }, 'Processing batch of images')

    for (const image of images) {
      if (await generateAndSaveBlurhash(image.id)) {
        processed++
      } else {
        failed++
        logger?.warn(
          { imageId: image.id },
          'Failed to generate blurhash, skipping future retries in this run'
        )
      }
    }

    logger?.info(
      { processed, failed, remaining: images.length },
      'Batch completed'
    )
  }

  logger?.info(
    { totalProcessed: processed, totalFailed: failed },
    'Finished processing images'
  )
}

async function generateAndSaveBlurhash(imageId: string): Promise<boolean> {
  const blurhash = await generateBlurhash(imageId)
  if (blurhash) {
    await prisma.cloudflareImage.update({
      where: { id: imageId },
      data: { blurhash, blurhashAttemptedAt: new Date() }
    })
    return true
  }
  await prisma.cloudflareImage.update({
    where: { id: imageId },
    data: { blurhashAttemptedAt: new Date() }
  })
  return false
}
