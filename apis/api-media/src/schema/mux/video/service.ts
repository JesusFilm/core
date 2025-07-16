import Mux from '@mux/mux-node'

import { MaxResolutionTierEnum } from './enums/maxResolutionTier'

// Type guard to safely check if a value is a valid MaxResolutionTierEnum key
export function isValidMaxResolutionTier(
  value: string
): value is keyof typeof MaxResolutionTierEnum {
  return Object.prototype.hasOwnProperty.call(MaxResolutionTierEnum, value)
}

// Safely get MaxResolutionTierEnum value with fallback
export function getMaxResolutionValue(
  maxResolution: string | null | undefined
): '1080p' | '1440p' | '2160p' | undefined {
  if (!maxResolution) return undefined

  if (isValidMaxResolutionTier(maxResolution)) {
    return MaxResolutionTierEnum[maxResolution]
  }

  // Log warning for invalid values and fallback to default
  console.warn(
    `Invalid maxResolution value: ${maxResolution}. Falling back to 'fhd'.`
  )
  return MaxResolutionTierEnum.fhd
}

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

export async function createVideoByDirectUpload(
  userGenerated: boolean,
  maxResolution?: Mux.Video.Asset['max_resolution_tier'],
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
            { resolution: '480p' },
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
  maxResolution?: Mux.Video.Asset['max_resolution_tier'],
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
          { resolution: '480p' },
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

  // skip if the resolution already exists
  if (
    existingAsset.static_renditions?.files?.some(
      (file) => file.resolution === resolution
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
