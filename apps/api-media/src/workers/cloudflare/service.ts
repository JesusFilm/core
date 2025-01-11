import 'cloudflare/shims/node'

import Cloudflare from 'cloudflare'
import { Logger } from 'pino'
import fetch, { Response } from 'node-fetch'

import { prisma } from '../../lib/prisma'

export function getClient(): Cloudflare {
  if (process.env.CLOUDFLARE_STREAM_TOKEN == null)
    throw new Error('Missing CLOUDFLARE_STREAM_TOKEN')

  return new Cloudflare({
    apiToken: process.env.CLOUDFLARE_STREAM_TOKEN,
    fetch
  })
}

export async function service(_logger?: Logger): Promise<void> {
  let done = false
  let skip = 0
  while (!done) {
    const videos = await prisma.cloudflareVideo.findMany({
      select: { id: true },
      where: {
        downloadable: false
      },
      take: 100,
      skip
    })
    skip += videos.length
    done = videos.length < 100
    
  }

}