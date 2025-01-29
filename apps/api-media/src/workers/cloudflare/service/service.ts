import 'cloudflare/shims/node'

import Cloudflare from 'cloudflare'
import uniq from 'lodash/uniq'
import fetch from 'node-fetch'
import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

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

  const dbVideoIds = await getDbVideos()
  logger?.info(`${dbVideoIds.length} db videos found`)

  const videosToRemove = videoIds.filter((id) => !dbVideoIds.includes(id))
  logger?.info(`${videosToRemove.length} cloudflare videos to remove`)

  // for (const videoId of videosToRemove) {
  //   await deleteCloudflareVideo(cloudflare, videoId, logger)
  // }

  const downloadsToRemove = videoIds.filter((id) => dbVideoIds.includes(id))
  logger?.info(`${downloadsToRemove.length} cloudflare downloads to remove`)

  for (const videoId of downloadsToRemove) {
    await deleteCloudflareDownload(cloudflare, videoId, logger)
  }
}

async function getCloudflareVideos(cloudflare: Cloudflare): Promise<string[]> {
  let result: string[] = []
  let done = false
  let last = undefined
  while (!done) {
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

async function getDbVideos(): Promise<string[]> {
  const videos = await prisma.cloudflareVideo.findMany({
    select: { id: true }
  })
  return videos.map(({ id }) => id)
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

async function deleteCloudflareDownload(
  cloudflare: Cloudflare,
  videoId: string,
  logger?: Logger
): Promise<void> {
  try {
    await cloudflare.stream.downloads.delete(videoId, {
      account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string
    })
    logger?.info(`deleted cloudflare download ${videoId}`)
  } catch {
    logger?.error(`unable to delete cloudflare download ${videoId}`)
  }
}
