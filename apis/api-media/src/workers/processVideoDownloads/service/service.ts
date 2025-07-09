import Mux from '@mux/mux-node'
import { AssetOptions } from '@mux/mux-node/resources/video/assets'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import {
  MuxVideo,
  Prisma,
  VideoVariant,
  VideoVariantDownloadQuality
} from '.prisma/api-media-client'

import { prisma } from '../../../lib/prisma'
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
    'Starting video downloads processing with static rendition monitoring'
  )

  try {
    // Get the latest video data with variants
    const video = await prisma.muxVideo.findUnique({
      where: { id: videoId },
      include: {
        videoVariants: true
      }
    })

    if (!video) {
      logger?.warn({ videoId }, 'Video not found')
      return
    }

    if (!video.assetId) {
      logger?.warn({ videoId }, 'Video has no asset ID')
      return
    }

    // Monitor the static rendition status until it reaches a final state
    const { finalStatus, muxVideo } = await monitorStaticRenditionStatus(
      video.assetId,
      isUserGenerated,
      logger
    )

    if (finalStatus === 'ready') {
      await processVideoDownloads(video, muxVideo, logger)
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

function mapStaticResolutionTierToDownloadQuality(
  resolutionTier: AssetOptions.StaticRendition['resolution']
): VideoVariantDownloadQuality | null {
  switch (resolutionTier) {
    case '270p':
      return VideoVariantDownloadQuality.low
    case '360p':
      return VideoVariantDownloadQuality.sd
    case '720p':
      return VideoVariantDownloadQuality.high
    case '1080p':
      return VideoVariantDownloadQuality.fhd
    case '1440p':
      return VideoVariantDownloadQuality.qhd
    case '2160p':
      return VideoVariantDownloadQuality.uhd
    default:
      return null
  }
}

const qualityEnumToOrder: Record<VideoVariantDownloadQuality, number> = {
  [VideoVariantDownloadQuality.distroLow]: 0,
  [VideoVariantDownloadQuality.distroSd]: 1,
  [VideoVariantDownloadQuality.distroHigh]: 2,
  [VideoVariantDownloadQuality.low]: 3,
  [VideoVariantDownloadQuality.sd]: 4,
  [VideoVariantDownloadQuality.high]: 5,
  [VideoVariantDownloadQuality.fhd]: 6,
  [VideoVariantDownloadQuality.qhd]: 7,
  [VideoVariantDownloadQuality.uhd]: 8,
  [VideoVariantDownloadQuality.highest]: 9 // only here for type safety
}

function getHighestResolutionDownload(
  downloads: Prisma.VideoVariantDownloadCreateManyInput[]
): Prisma.VideoVariantDownloadCreateManyInput {
  let highest = downloads[0]
  for (const download of downloads) {
    if (
      qualityEnumToOrder[download.quality] > qualityEnumToOrder[highest.quality]
    ) {
      highest = download
    }
  }
  return highest
}

function downloadsReadyToStore(muxVideo: Mux.Video.Asset): boolean {
  return (
    muxVideo.static_renditions?.files?.every(
      (file) =>
        file.status === 'ready' ||
        file.status === 'skipped' ||
        file.status === 'errored'
    ) ?? false
  )
}

async function monitorStaticRenditionStatus(
  assetId: string,
  isUserGenerated: boolean,
  logger?: Logger
): Promise<
  | { finalStatus: 'ready'; muxVideo: Mux.Video.Asset }
  | { finalStatus: 'timeout'; muxVideo: null }
> {
  const monitoringIntervalMs = 10000 // 10 seconds
  const maxAttempts = 180 // 30 minutes (180 * 10 seconds)
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const muxVideo = await getVideo(assetId, isUserGenerated)

      // Check if static renditions exist
      if (!muxVideo.static_renditions?.files) {
        // logger?.info(
        //   { assetId, attempt: attempts + 1, maxAttempts },
        //   'No static renditions found yet, continuing to monitor'
        // )
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

      //   logger?.info(
      //     {
      //       assetId,
      //       attempt: attempts + 1,
      //       maxAttempts,
      //       renditionStatuses
      //     },
      //     'Monitoring static rendition status'
      //   )

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
        logger?.info(
          { assetId, totalAttempts: attempts + 1, renditionStatuses },
          'All static renditions are ready'
        )
        return { finalStatus: 'ready', muxVideo }
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
  return { finalStatus: 'timeout', muxVideo: null }
}

async function processVideoDownloads(
  video: MuxVideo & { videoVariants: VideoVariant[] },
  muxVideo: Mux.Video.Asset,
  logger?: Logger
): Promise<void> {
  if (
    muxVideo.status === 'ready' &&
    muxVideo.playback_ids?.[0].id != null &&
    (!video.downloadable || downloadsReadyToStore(muxVideo))
  ) {
    // Update video metadata
    await prisma.muxVideo.update({
      where: { id: video.id },
      data: {
        readyToStream: muxVideo.status === 'ready',
        playbackId: muxVideo.playback_ids?.[0].id,
        duration: Math.ceil(muxVideo.duration ?? 0)
      }
    })

    // Process downloads if ready and video has variants
    if (
      muxVideo.static_renditions?.files != null &&
      video.videoVariants.length > 0
    ) {
      const validDownloads: Prisma.VideoVariantDownloadCreateManyInput[] =
        muxVideo.static_renditions.files
          .filter(
            (file) =>
              file != null &&
              file.resolution != null &&
              file.status !== 'skipped' &&
              file.status !== 'errored' &&
              mapStaticResolutionTierToDownloadQuality(file.resolution) != null
          )
          .map((file) => ({
            videoVariantId: video.videoVariants[0].id,
            quality: mapStaticResolutionTierToDownloadQuality(
              file.resolution as AssetOptions.StaticRendition['resolution']
            ) as VideoVariantDownloadQuality,
            url: `https://stream.mux.com/${muxVideo.playback_ids?.[0].id}/${file.resolution}.mp4`,
            version: 1,
            size: file.filesize ? parseInt(file.filesize) : 0,
            height: file.height ?? 0,
            width: file.width ?? 0,
            bitrate: file.bitrate ?? 0
          }))

      if (validDownloads.length > 0) {
        // Find the highest quality by enum up to uhd since mux doesn't generate highest enum
        const highest = getHighestResolutionDownload(validDownloads)
        const data = [...validDownloads, highest]

        await prisma.videoVariantDownload.createMany({
          data: data
        })

        logger?.info(
          { videoId: video.id, downloadsCount: data.length },
          'Successfully created video downloads'
        )
      }
    }
  }
}
