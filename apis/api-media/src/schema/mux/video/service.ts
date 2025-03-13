import Mux from '@mux/mux-node'

function getClient(): Mux {
  if (process.env.MUX_UGC_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_UGC_ACCESS_TOKEN_ID')

  if (process.env.MUX_UGC_SECRET_KEY == null)
    throw new Error('Missing MUX_UGC_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_UGC_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_UGC_SECRET_KEY
  })
}

type ResolutionTier = '1080p' | '1440p' | '2160p' | undefined

export async function createVideoByDirectUpload(
  maxResolution: ResolutionTier = '1080p',
  downloadable = false
): Promise<{ id: string; uploadUrl: string }> {
  if (process.env.CORS_ORIGIN == null) throw new Error('Missing CORS_ORIGIN')

  const response = await getClient().video.uploads.create({
    cors_origin: process.env.CORS_ORIGIN,
    new_asset_settings: {
      encoding_tier: 'smart',
      playback_policy: ['public'],
      max_resolution_tier: maxResolution,
      mp4_support: downloadable ? 'capped-1080p' : 'none'
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
  maxResolution: ResolutionTier = '1080p',
  downloadable = false
): Promise<Mux.Video.Asset> {
  return await getClient().video.assets.create({
    input: [
      {
        url
      }
    ],
    encoding_tier: 'smart',
    playback_policy: ['public'],
    max_resolution_tier: maxResolution,
    mp4_support: downloadable ? 'capped-1080p' : 'none'
  })
}

export async function getVideo(videoId: string): Promise<Mux.Video.Asset> {
  return await getClient().video.assets.retrieve(videoId)
}

export async function getUpload(uploadId: string): Promise<Mux.Video.Upload> {
  return await getClient().video.uploads.retrieve(uploadId)
}

export async function deleteVideo(videoId: string): Promise<void> {
  await getClient().video.assets.delete(videoId)
}

export async function enableDownload(videoId: string): Promise<void> {
  await getClient().video.assets.updateMP4Support(videoId, {
    mp4_support: 'capped-1080p'
  })
}
