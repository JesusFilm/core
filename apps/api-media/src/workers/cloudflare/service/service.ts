import 'cloudflare/shims/node'

import Cloudflare from 'cloudflare'
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
  await createCloudflareDownloads(logger)
}

async function createCloudflareDownloads(logger?: Logger): Promise<void> {
  let done = false
  let page = 0
  const cloudflare = getClient()
  logger?.info('Starting Cloudflare download creator')
  while (!done) {
    logger?.info(`Processing cloudflare page ${page}`)
    const skip = page * 100
    const videos = await prisma.cloudflareVideo.findMany({
      select: { id: true },
      where: {
        downloadable: false
      },
      take: 100,
      skip
    })
    page++
    done = videos.length < 100
    for (const video of videos) {
      await cloudflare.stream.downloads.create(video.id, {
        account_id: process.env.CLOUDFLARE_ACCOUNT_ID as string,
        body: {}
      })
      await prisma.cloudflareVideo.update({
        where: {
          id: video.id
        },
        data: {
          downloadable: true
        }
      })
    }
  }
  logger?.info('Cloudflare download creator complete')
}
