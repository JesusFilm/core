import 'cloudflare/shims/node'

import Cloudflare from 'cloudflare'
import uniq from 'lodash/uniq'
import fetch from 'node-fetch'
import { Logger } from 'pino'

export function getClient(): Cloudflare {
  if (process.env.CLOUDFLARE_STREAM_TOKEN == null)
    throw new Error('Missing CLOUDFLARE_STREAM_TOKEN')

  return new Cloudflare({
    apiToken: process.env.CLOUDFLARE_STREAM_TOKEN,
    fetch
  })
}

export async function service(logger?: Logger): Promise<void> {
  const cloudflare = getClient()
  const videoIds = await getCloudflareVideos(cloudflare)
  logger?.info(`${videoIds.length} cloudflare videos found`)

  for (const videoId of videoIds) {
    await deleteCloudflareVideo(cloudflare, videoId, logger)
  }
}

async function getCloudflareVideos(cloudflare: Cloudflare): Promise<string[]> {
  let result: string[] = []
  let done = false
  let last = undefined
  while (!done) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const videos = await cloudflare.stream.list({
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string,
      asc: true,
      start: last
    })

    result = [
      ...result,
      ...videos.result.map(({ uid }) => uid).filter((id) => id != null)
    ]
    last = videos.result[videos.result.length - 1].created
    if (videos.result.length < 1000) done = true
  }
  return uniq(result)
}

async function deleteCloudflareVideo(
  cloudflare: Cloudflare,
  videoId: string,
  logger?: Logger
): Promise<void> {
  try {
    await cloudflare.stream.delete(videoId, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
    })
    logger?.info(`deleted cloudflare video ${videoId}`)
  } catch {
    logger?.error(`unable to delete cloudflare video ${videoId}`)
  }
}
