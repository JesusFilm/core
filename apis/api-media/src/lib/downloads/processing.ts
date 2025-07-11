import { AssetOptions } from '@mux/mux-node/resources/video/assets'
import { Logger } from 'pino'

import { Prisma, VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prisma } from '../prisma'

export const qualityEnumToOrder: Record<VideoVariantDownloadQuality, number> = {
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

export function mapStaticResolutionTierToDownloadQuality(
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

export function getHighestResolutionDownload(
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
  return { ...highest, quality: VideoVariantDownloadQuality.highest }
}

export function downloadsReadyToStore(muxVideo: {
  static_renditions?: {
    files?: Array<{ status?: string } | null> | null
  } | null
}): boolean {
  return (
    muxVideo.static_renditions?.files?.every(
      (file) =>
        file != null &&
        (file.status === 'ready' ||
          file.status === 'skipped' ||
          file.status === 'errored')
    ) ?? false
  )
}

export interface CreateDownloadsFromMuxAssetOptions {
  variantId: string
  muxVideoAsset: {
    playback_ids?: Array<{ id?: string }> | null
    static_renditions?: {
      files?: Array<{
        resolution?: string
        status?: string
        filesize?: string | null
        height?: number | null
        width?: number | null
        bitrate?: number | null
      } | null> | null
    } | null
  }
  logger?: Logger
}

export async function createDownloadsFromMuxAsset({
  variantId,
  muxVideoAsset,
  logger
}: CreateDownloadsFromMuxAssetOptions): Promise<number> {
  if (muxVideoAsset.static_renditions?.files == null) {
    logger?.info({ variantId }, 'No static renditions files available')
    return 0
  }

  const playbackId = muxVideoAsset.playback_ids?.[0]?.id
  if (!playbackId) {
    logger?.info({ variantId }, 'No playback ID available')
    return 0
  }

  const validDownloads: Prisma.VideoVariantDownloadCreateManyInput[] =
    muxVideoAsset.static_renditions.files
      .filter(
        (file) =>
          file != null &&
          file.resolution != null &&
          file.status !== 'skipped' &&
          file.status !== 'errored' &&
          mapStaticResolutionTierToDownloadQuality(
            file.resolution as AssetOptions.StaticRendition['resolution']
          ) != null
      )
      .map((file) => ({
        videoVariantId: variantId,
        quality: mapStaticResolutionTierToDownloadQuality(
          file!.resolution as AssetOptions.StaticRendition['resolution']
        ) as VideoVariantDownloadQuality,
        url: `https://stream.mux.com/${playbackId}/${file!.resolution}.mp4`,
        version: 1,
        size: file!.filesize ? parseInt(file!.filesize) : 0,
        height: file!.height ?? 0,
        width: file!.width ?? 0,
        bitrate: file!.bitrate ?? 0
      }))

  if (validDownloads.length === 0) {
    logger?.info({ variantId }, 'No valid downloads to create')
    return 0
  }

  // Find the highest quality by enum up to uhd since mux doesn't generate highest enum
  const highest = getHighestResolutionDownload(validDownloads)
  const data = [...validDownloads, highest]

  // Create downloads individually to handle duplicates gracefully
  let createdCount = 0
  for (const download of data) {
    try {
      await prisma.videoVariantDownload.create({
        data: download
      })
      createdCount++
    } catch (error: any) {
      // Skip if already exists (P2002 constraint violation)
      if (error?.code === 'P2002') {
        logger?.info(
          {
            videoVariantId: variantId,
            quality: download.quality
          },
          'Download already exists, skipping'
        )
      } else {
        logger?.error(
          {
            error,
            videoVariantId: variantId,
            quality: download.quality
          },
          'Failed to create individual download'
        )
      }
    }
  }

  return createdCount
}
