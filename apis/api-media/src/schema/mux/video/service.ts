import Mux from '@mux/mux-node'
import { Asset, AssetOptions } from '@mux/mux-node/resources/video/assets'

import { Prisma, VideoVariantDownloadQuality } from '.prisma/api-media-client'

function getClient(userGenerated: boolean): Mux {
  if (userGenerated) {
    if (process.env.MUX_UGC_ACCESS_TOKEN_ID == null)
      throw new Error('Missing MUX_UGC_ACCESS_TOKEN_ID')

    if (process.env.MUX_UGC_SECRET_KEY == null)
      throw new Error('Missing MUX_UGC_SECRET_KEY')

    return new Mux({
      tokenId: process.env.MUX_UGC_ACCESS_TOKEN_ID,
      tokenSecret: process.env.MUX_UGC_SECRET_KEY
    })
  }

  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_ACCESS_TOKEN_ID')

  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

type ResolutionTier = '1080p' | '1440p' | '2160p' | undefined

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
  return highest
}

export function downloadsReadyToStore(muxVideo: Mux.Video.Asset): boolean {
  return (
    muxVideo.static_renditions?.files?.every(
      (file) =>
        file.status === 'ready' ||
        file.status === 'skipped' ||
        file.status === 'errored'
    ) ?? false
  )
}

export async function createVideoByDirectUpload(
  userGenerated: boolean,
  maxResolution?: ResolutionTier,
  downloadable = false
): Promise<{ id: string; uploadUrl: string }> {
  if (process.env.CORS_ORIGIN == null) throw new Error('Missing CORS_ORIGIN')

  const response = await getClient(userGenerated).video.uploads.create({
    cors_origin: process.env.CORS_ORIGIN,
    new_asset_settings: {
      encoding_tier: 'smart',
      playback_policy: ['public'],
      max_resolution_tier: userGenerated ? '1080p' : maxResolution,
      static_renditions: downloadable
        ? [
            { resolution: '270p' },
            { resolution: '360p' },
            { resolution: '720p' },
            { resolution: '1080p' },
            { resolution: '1440p' },
            { resolution: '2160p' }
          ]
        : []
    }
  })

  const id = response.id
  const uploadUrl = response.url

  if (id == null || uploadUrl == null)
    throw new Error("Couldn't get upload information from cloudflare")

  return {
    id,
    uploadUrl
  }
}

export async function createVideoFromUrl(
  url: string,
  userGenerated: boolean,
  maxResolution?: ResolutionTier,
  downloadable = false
): Promise<Mux.Video.Asset> {
  return await getClient(userGenerated).video.assets.create({
    inputs: [
      {
        url
      }
    ],
    encoding_tier: 'smart',
    playback_policy: ['public'],
    max_resolution_tier: userGenerated ? '1080p' : maxResolution,
    static_renditions: downloadable
      ? [
          { resolution: '270p' },
          { resolution: '360p' },
          { resolution: '720p' },
          { resolution: '1080p' },
          { resolution: '1440p' },
          { resolution: '2160p' }
        ]
      : []
  })
}

export async function getVideo(
  videoId: string,
  userGenerated: boolean
): Promise<Mux.Video.Asset> {
  return await getClient(userGenerated).video.assets.retrieve(videoId)
}

export async function getUpload(
  uploadId: string,
  userGenerated: boolean
): Promise<Mux.Video.Upload> {
  return await getClient(userGenerated).video.uploads.retrieve(uploadId)
}

export async function deleteVideo(
  videoId: string,
  userGenerated: boolean
): Promise<void> {
  await getClient(userGenerated).video.assets.delete(videoId)
}

export async function enableDownload(
  assetId: string,
  userGenerated: boolean,
  resolution: string
): Promise<void> {
  // get existing static renditions
  const existingAsset =
    await getClient(userGenerated).video.assets.retrieve(assetId)

  // skip if the resolution already exists - check both resolution_tier and resolution fields
  if (
    existingAsset.static_renditions?.files?.some(
      (file) =>
        file.resolution_tier === resolution || file.resolution === resolution
    )
  )
    return

  await getClient(userGenerated).post(
    `/video/v1/assets/${assetId}/static-renditions`,
    {
      body: {
        resolution
      }
    }
  )
}

export async function getStaticRenditions(
  assetId: string,
  userGenerated: boolean
): Promise<Mux.Video.Asset['static_renditions']> {
  const asset = await getClient(userGenerated).video.assets.retrieve(assetId)
  return asset.static_renditions
}
