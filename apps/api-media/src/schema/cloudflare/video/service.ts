import Cloudflare from 'cloudflare'
import { Video } from 'cloudflare/resources/stream/stream'

function getClient(): Cloudflare {
  if (process.env.CLOUDFLARE_STREAM_TOKEN == null)
    throw new Error('Missing CLOUDFLARE_STREAM_TOKEN')

  return new Cloudflare({
    apiToken: process.env.CLOUDFLARE_STREAM_TOKEN
  })
}

export async function createVideoByDirectUpload(
  uploadLength: number,
  name: string,
  userId: string
): Promise<{ id: string; uploadUrl: string }> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  const response = await getClient()
    .post(
      `/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`,
      {
        headers: {
          Accept: '*/*',
          'Tus-Resumable': '1.0.0',
          'Upload-Length': uploadLength.toString(),
          'Upload-Creator': userId,
          'Upload-Metadata': 'name ' + btoa(name.replace(/\W/g, ''))
        }
      }
    )
    .asResponse()

  const id = response.headers.get('stream-media-id')
  const uploadUrl = response.headers.get('Location')

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

  return await getClient().stream.copy.create({
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    url,
    creator: userId
  })
}

export async function deleteVideo(videoId: string): Promise<void> {
  if (process.env.CLOUDFLARE_ACCOUNT_ID == null)
    throw new Error('Missing CLOUDFLARE_ACCOUNT_ID')

  await getClient().stream.delete(videoId, {
    account_id: process.env.CLOUDFLARE_ACCOUNT_ID
  })
}
