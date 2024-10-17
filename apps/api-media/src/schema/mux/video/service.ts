import Mux from '@mux/mux-node'
import { Video } from 'cloudflare/resources/stream/stream'

function getClient(): Mux {
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
  uploadLength: number,
  name: string,
  userId: string,
  maxResolution: '1080p' | '1440p' | '2160p' | undefined,
  downloadable = false
): Promise<{ id: string; uploadUrl: string }> {
  if (process.env.CORS_ORIGIN == null) throw new Error('Missing CORS_ORIGIN')

  const response = await getClient().video.uploads.create({
    cors_origin: process.env.CORS_ORIGIN,
    new_asset_settings: {
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
  userId: string
): Promise<Video> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  return await getClient().video.assets.create({
    input: {
      url,
      playback_policy: ['public'],
      max_resolution_tier: maxResolution,
      mp4_support: downloadable ? 'capped-1080p' : 'none'
    }
  })
  return await getClient().stream.copy.create({
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    url,
    creator: userId
  })
}

export async function getVideo(videoId: string): Promise<Video> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  return await getClient().stream.get(videoId, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID
  })
}

export async function deleteVideo(videoId: string): Promise<void> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  await getClient().stream.delete(videoId, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID
  })
}
