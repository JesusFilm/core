import Mux from '@mux/mux-node'
import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

function getMuxClient(): Mux {
  if (process.env.MUX_ACCESS_TOKEN_ID == null)
    throw new Error('Missing MUX_UGC_ACCESS_TOKEN_ID')

  if (process.env.MUX_SECRET_KEY == null)
    throw new Error('Missing MUX_UGC_SECRET_KEY')

  return new Mux({
    tokenId: process.env.MUX_ACCESS_TOKEN_ID,
    tokenSecret: process.env.MUX_SECRET_KEY
  })
}

export async function service(logger?: Logger): Promise<void> {
  logger?.info('mux import started')

  const mux = getMuxClient()
  let done = false
  let page = 0
  while (!done) {
    const skip = page * 100
    const prismaMuxVideos = await prisma.muxVideo.findMany({
      where: { playbackId: null, assetId: { not: null } },
      include: { VideoVariant: { select: { id: true } } },
      take: 100,
      skip
    })
    for (const prismaMuxVideo of prismaMuxVideos) {
      const asset = await mux.video.assets.retrieve(
        prismaMuxVideo.assetId as string
      )
      if (asset.status === 'ready' && asset.playback_ids?.[0].id != null) {
        const playbackId = asset.playback_ids[0].id
        await prisma.muxVideo.update({
          where: { id: prismaMuxVideo.id },
          data: { playbackId, readyToStream: true }
        })
        for (const videoVariant of prismaMuxVideo.VideoVariant) {
          await prisma.videoVariantDownload.upsert({
            where: {
              quality_videoVariantId: {
                quality: 'high',
                videoVariantId: videoVariant.id
              }
            },
            update: { url: `https://stream.mux.com/${playbackId}.m3u8` },
            create: {
              videoVariantId: videoVariant.id,
              quality: 'high',
              url: `https://stream.mux.com/${playbackId}.m3u8`
            }
          })
          await prisma.videoVariant.update({
            where: { id: videoVariant.id },
            data: { hls: `https://stream.mux.com/${playbackId}.m3u8` }
          })
        }
      }
    }
    if (prismaMuxVideos.length < 100) done = true
    page++
  }
  logger?.info('mux import finished')
}
