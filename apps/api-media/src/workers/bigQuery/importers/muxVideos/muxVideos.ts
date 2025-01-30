import Mux from '@mux/mux-node'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoVariantIds } from '../videoVariants'

const s3Schema = z.object({
  videoVariantId: z.string(),
  masterUri: z.string(),
  height: z.number(),
  width: z.number()
})

function getMuxClient(): Mux {
  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_ACCESS_TOKEN_ID')

  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

export async function importS3Videos(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantMaster_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function createMuxAsset(url: string, mux: Mux): Promise<string> {
  const muxVideo = await mux.video.assets.create({
    input: [
      {
        url: url
      }
    ],
    encoding_tier: 'smart',
    playback_policy: ['public'],
    max_resolution_tier: '1080p',
    mp4_support: 'capped-1080p'
  })
  return muxVideo.id
}

export async function importOne(row: unknown): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // wait 1 sec to avoid rate limit
  const video = parse(s3Schema, row)
  if (!getVideoVariantIds().includes(video.videoVariantId))
    throw new Error(`VideoVariant with id ${video.videoVariantId} not found`)
  const mux = getMuxClient()
  const muxVideoId = await createMuxAsset(video.masterUri, mux)
  const prismaMuxVideo = await prisma.muxVideo.create({
    data: {
      assetId: muxVideoId,
      userId: 'system'
    }
  })
  await prisma.videoVariant.update({
    where: {
      id: video.videoVariantId
    },
    data: {
      muxVideoId: prismaMuxVideo.id
    }
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videos, inValidRowIds } = parseMany(s3Schema, rows)

  const videosWithVariants = videos.filter(({ videoVariantId }) =>
    getVideoVariantIds().includes(videoVariantId)
  )

  for (const video of videosWithVariants) {
    await new Promise((resolve) => setTimeout(resolve, 1000)) // wait 1 sec to avoid rate limit
    const mux = getMuxClient()
    const muxVideoId = await createMuxAsset(video.masterUri, mux)
    const prismaMuxVideo = await prisma.muxVideo.create({
      data: {
        assetId: muxVideoId,
        userId: 'system'
      }
    })
    await prisma.videoVariant.update({
      where: {
        id: video.videoVariantId
      },
      data: {
        muxVideoId: prismaMuxVideo.id
      }
    })
  }

  if (videos.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)
}
