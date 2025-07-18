import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { getStaticRenditions } from '../../../schema/mux/video/service'

async function getVideoVariantsWithMuxDownloads(): Promise<
  Array<{
    id: string
    muxVideo: {
      assetId: string | null
    } | null
    downloads: Array<{
      id: string
      quality: string
      size: number | null
    }>
  }>
> {
  const videoVariants = await prisma.videoVariant.findMany({
    select: {
      id: true,
      muxVideo: {
        select: {
          assetId: true
        }
      },
      downloads: {
        select: {
          id: true,
          quality: true,
          size: true
        }
      }
    },
    where: {
      muxVideoId: { not: null },
      downloads: {
        some: {
          size: 0
        }
      }
    }
  })
  return videoVariants
}

export async function service(logger?: Logger): Promise<void> {
  logger?.info('mux downloads size update started')

  const videoVariants = await getVideoVariantsWithMuxDownloads()

  if (videoVariants.length === 0) {
    logger?.info('no video variants with missing download sizes found')
    return
  }

  logger?.info(
    `found ${videoVariants.length} video variants with missing download sizes`
  )

  const resolutionToQuality: Record<string, string> = {
    '720p': 'high',
    '360p': 'sd',
    '270p': 'low'
  }

  let processedCount = 0
  let updatedCount = 0

  for (const videoVariant of videoVariants) {
    try {
      if (!videoVariant.muxVideo?.assetId) {
        continue
      }

      // Rate limit: wait 2 seconds between Mux API calls
      if (processedCount > 0) {
        logger?.info(
          { videoVariantId: videoVariant.id },
          'rate limiting: waiting 2 seconds before next Mux API call'
        )
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      // Get static renditions from Mux
      const staticRenditions = await getStaticRenditions(
        videoVariant.muxVideo.assetId,
        false
      )

      if (!staticRenditions?.files) {
        logger?.warn(
          { videoVariantId: videoVariant.id },
          'no static renditions found'
        )
        continue
      }

      // Update each download with the correct size
      for (const download of videoVariant.downloads) {
        if (download.size != null && download.size > 0) {
          continue // Skip downloads that already have sizes
        }

        // Find the corresponding static rendition file
        const staticFile = staticRenditions.files.find((file) => {
          // Use resolution field first, then fall back to resolution_tier
          const muxResolution = file.resolution || file.resolution_tier
          return (
            muxResolution &&
            resolutionToQuality[muxResolution] === download.quality
          )
        })

        if (staticFile?.filesize && staticFile.status === 'ready') {
          const newSize = parseInt(staticFile.filesize, 10)

          await prisma.videoVariantDownload.update({
            where: { id: download.id },
            data: {
              size: newSize
            }
          })

          updatedCount++
          logger?.info(
            {
              downloadId: download.id,
              quality: download.quality,
              size: newSize
            },
            'updated download size'
          )
        }
      }

      processedCount++
    } catch (error) {
      logger?.error(
        { error, videoVariantId: videoVariant.id },
        'failed to update video variant download sizes'
      )
    }
  }

  logger?.info(
    `mux downloads size update finished - processed ${processedCount} video variants, updated ${updatedCount} downloads`
  )
}
