import Mux from '@mux/mux-node'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { MuxVideo, prisma } from '@core/prisma/media/client'

import {
  createDownloadsFromMuxAsset,
  downloadsReadyToStore
} from '../../../lib/downloads'
import { getVideo } from '../../../schema/mux/video/service'

interface ProcessVideoDownloadsJobData {
  videoId: string
  assetId: string
  isUserGenerated: boolean
}

export async function service(
  job: Job<ProcessVideoDownloadsJobData>,
  logger?: Logger
): Promise<void> {
  const { videoId, assetId, isUserGenerated } = job.data

  logger?.info(
    { videoId, assetId },
    'Starting video downloads processing with static rendition monitoring for videoId: ' +
      videoId +
      ' and assetId: ' +
      assetId
  )

  try {
    // Get the latest video data with variants
    const muxVideo = await prisma.muxVideo.findUnique({
      where: { id: videoId }
    })

    if (!muxVideo) {
      logger?.warn({ videoId }, 'Video not found')
      return
    }

    if (!muxVideo.assetId) {
      logger?.warn({ videoId }, 'Video has no asset ID')
      return
    }

    // Monitor the static rendition status until it reaches a final state
    const { finalStatus, muxVideoAsset } = await monitorStaticRenditionStatus(
      muxVideo.assetId,
      isUserGenerated,
      logger
    )

    if (finalStatus === 'ready') {
      await processVideoDownloads(muxVideo, muxVideoAsset, logger)
    }

    logger?.info(
      { videoId, finalStatus },
      'Static rendition downloads processing completed'
    )
  } catch (error) {
    logger?.error(
      { error, videoId, assetId },
      'Failed to process video downloads'
    )
    throw error
  }
}

async function monitorStaticRenditionStatus(
  assetId: string,
  isUserGenerated: boolean,
  logger?: Logger
): Promise<
  | { finalStatus: 'ready'; muxVideoAsset: Mux.Video.Asset }
  | { finalStatus: 'timeout'; muxVideoAsset: null }
> {
  const monitoringIntervalMs = 10000 // 10 seconds
  const maxAttempts = 180 // 30 minutes (180 * 10 seconds)
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const muxVideo = await getVideo(assetId, isUserGenerated)

      // Check if static renditions exist
      if (!muxVideo.static_renditions?.files) {
        attempts++
        await new Promise((resolve) =>
          setTimeout(resolve, monitoringIntervalMs)
        )
        continue
      }

      const renditionStatuses = muxVideo.static_renditions.files.map(
        (file) => ({
          resolution: file?.resolution_tier,
          status: file?.status,
          filesize: file?.filesize
        })
      )

      // Check if any static renditions are errored
      const hasErrored = muxVideo.static_renditions.files.some(
        (file) => file?.status === 'errored'
      )

      if (hasErrored) {
        logger?.error(
          { assetId, totalAttempts: attempts + 1, renditionStatuses },
          'Static renditions have errored status'
        )
      }

      // Check if all static renditions are ready
      const allReady = muxVideo.static_renditions.files.every(
        (file) =>
          file?.status === 'ready' ||
          file?.status === 'skipped' ||
          file?.status === 'errored'
      )

      if (allReady) {
        return { finalStatus: 'ready', muxVideoAsset: muxVideo }
      }

      // Continue monitoring if renditions are still processing

      attempts++

      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, monitoringIntervalMs))
    } catch (error) {
      logger?.error(
        { error, assetId, attempt: attempts + 1 },
        'Error monitoring static rendition status'
      )
      attempts++

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, monitoringIntervalMs))
    }
  }

  logger?.warn(
    {
      assetId,
      maxAttempts,
      totalTimeMinutes: (maxAttempts * monitoringIntervalMs) / 60000
    },
    'Static rendition monitoring reached maximum attempts without final status'
  )
  return { finalStatus: 'timeout', muxVideoAsset: null }
}

async function processVideoDownloads(
  muxVideo: MuxVideo,
  muxVideoAsset: Mux.Video.Asset,
  logger?: Logger
): Promise<void> {
  if (
    muxVideoAsset.status === 'ready' &&
    muxVideoAsset.playback_ids?.[0].id != null &&
    (!muxVideo.downloadable || downloadsReadyToStore(muxVideoAsset))
  ) {
    // Update video metadata
    await prisma.muxVideo.update({
      where: { id: muxVideo.id },
      data: {
        readyToStream: muxVideoAsset.status === 'ready',
        playbackId: muxVideoAsset.playback_ids?.[0].id,
        duration: Math.ceil(muxVideoAsset.duration ?? 0)
      }
    })

    const videoVariants = await prisma.videoVariant.findMany({
      where: { muxVideoId: muxVideo.id }
    }) // doesn't seem to work with include on the muxVideo object

    // Process downloads if ready and video has variants
    if (
      muxVideoAsset.static_renditions?.files != null &&
      videoVariants.length > 0
    ) {
      for (const videoVariant of videoVariants) {
        const createdCount = await createDownloadsFromMuxAsset({
          variantId: videoVariant.id,
          muxVideoAsset,
          logger
        })

        logger?.info(
          {
            videoId: muxVideo.id,
            videoVariantId: videoVariant.id,
            downloadsCount: createdCount
          },
          'Successfully created video downloads'
        )
      }
    }
  }
}
