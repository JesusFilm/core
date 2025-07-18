import { AssetOptions } from '@mux/mux-node/resources/video/assets'
import { Logger } from 'pino'

import {
  Prisma,
  VideoVariantDownloadQuality,
  prisma
} from '@core/prisma-media/client'

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
    case '480p':
      return null // Will be handled by fallback logic
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

// Helper function to get numeric resolution for comparison
function getResolutionHeight(resolution: string): number {
  return parseInt(resolution.replace('p', ''))
}

// Enhanced function that handles fallbacks for sd and high qualities
export function mapStaticResolutionTierToDownloadQualityWithFallback(
  availableFiles: Array<{
    resolution?: string
    status?: string
    filesize?: string | null
    height?: number | null
    width?: number | null
    bitrate?: number | null
  } | null>,
  targetResolution: string
): { resolution: string; quality: VideoVariantDownloadQuality } | null {
  // Get all ready files sorted by resolution height (ascending)
  const readyFiles = availableFiles
    .filter(
      (file) =>
        file != null &&
        file.resolution &&
        file.status !== 'skipped' &&
        file.status !== 'errored'
    )
    .map((file) => ({
      resolution: file!.resolution!,
      height: getResolutionHeight(file!.resolution!)
    }))
    .sort((a, b) => a.height - b.height)

  if (readyFiles.length === 0) return null

  const targetHeight = getResolutionHeight(targetResolution)

  // Check if exact resolution is available
  const exactMatch = readyFiles.find(
    (file) => file.resolution === targetResolution
  )
  if (exactMatch) {
    const quality = mapStaticResolutionTierToDownloadQuality(
      targetResolution as AssetOptions.StaticRendition['resolution']
    )
    if (quality) {
      return { resolution: targetResolution, quality }
    }
  }

  // For sd (360p) and high (720p), find the highest available resolution that's lower than target
  if (targetResolution === '360p' || targetResolution === '720p') {
    const lowerResolutions = readyFiles.filter(
      (file) => file.height < targetHeight
    )

    if (lowerResolutions.length > 0) {
      // Get the highest resolution that's still lower than target
      const fallbackFile = lowerResolutions[lowerResolutions.length - 1]
      const fallbackQuality =
        targetResolution === '360p'
          ? VideoVariantDownloadQuality.sd
          : VideoVariantDownloadQuality.high

      return {
        resolution: fallbackFile.resolution,
        quality: fallbackQuality
      }
    }
  }

  return null
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

  // First, process files with direct mappings
  const directMappings: Prisma.VideoVariantDownloadCreateManyInput[] = []
  const processedQualities = new Set<VideoVariantDownloadQuality>()

  for (const file of muxVideoAsset.static_renditions.files) {
    if (
      file != null &&
      file.resolution != null &&
      file.status !== 'skipped' &&
      file.status !== 'errored'
    ) {
      const quality = mapStaticResolutionTierToDownloadQuality(
        file.resolution as AssetOptions.StaticRendition['resolution']
      )

      if (quality != null) {
        directMappings.push({
          videoVariantId: variantId,
          quality,
          url: `https://stream.mux.com/${playbackId}/${file.resolution}.mp4`,
          version: 1,
          size: file.filesize ? parseInt(file.filesize) : 0,
          height: file.height ?? 0,
          width: file.width ?? 0,
          bitrate: file.bitrate ?? 0
        })
        processedQualities.add(quality)
      }
    }
  }

  // Handle fallbacks for sd and high if they're missing
  const fallbackMappings: Prisma.VideoVariantDownloadCreateManyInput[] = []

  // Check for sd fallback (if 360p is not available)
  if (!processedQualities.has(VideoVariantDownloadQuality.sd)) {
    const sdFallback = mapStaticResolutionTierToDownloadQualityWithFallback(
      muxVideoAsset.static_renditions.files,
      '360p'
    )

    if (sdFallback) {
      const fallbackFile = muxVideoAsset.static_renditions.files.find(
        (file) => file?.resolution === sdFallback.resolution
      )

      if (fallbackFile) {
        fallbackMappings.push({
          videoVariantId: variantId,
          quality: sdFallback.quality,
          url: `https://stream.mux.com/${playbackId}/${sdFallback.resolution}.mp4`,
          version: 1,
          size: fallbackFile.filesize ? parseInt(fallbackFile.filesize) : 0,
          height: fallbackFile.height ?? 0,
          width: fallbackFile.width ?? 0,
          bitrate: fallbackFile.bitrate ?? 0
        })

        logger?.info(
          { variantId, fallbackResolution: sdFallback.resolution },
          'Using fallback resolution for sd quality'
        )
      }
    }
  }

  // Check for high fallback (if 720p is not available)
  if (!processedQualities.has(VideoVariantDownloadQuality.high)) {
    const highFallback = mapStaticResolutionTierToDownloadQualityWithFallback(
      muxVideoAsset.static_renditions.files,
      '720p'
    )

    if (highFallback) {
      const fallbackFile = muxVideoAsset.static_renditions.files.find(
        (file) => file?.resolution === highFallback.resolution
      )

      if (fallbackFile) {
        fallbackMappings.push({
          videoVariantId: variantId,
          quality: highFallback.quality,
          url: `https://stream.mux.com/${playbackId}/${highFallback.resolution}.mp4`,
          version: 1,
          size: fallbackFile.filesize ? parseInt(fallbackFile.filesize) : 0,
          height: fallbackFile.height ?? 0,
          width: fallbackFile.width ?? 0,
          bitrate: fallbackFile.bitrate ?? 0
        })

        logger?.info(
          { variantId, fallbackResolution: highFallback.resolution },
          'Using fallback resolution for high quality'
        )
      }
    }
  }

  const validDownloads = [...directMappings, ...fallbackMappings]

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
