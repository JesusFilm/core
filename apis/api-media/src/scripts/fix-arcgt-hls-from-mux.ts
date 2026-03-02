import { PrismaClient } from '.prisma/api-media-client'

import { getVideo } from '../schema/mux/video/service'

const prisma = new PrismaClient()

const BATCH_SIZE = 100
const ARC_GT_MATCH = 'arc.gt'
const MUX_STREAM_BASE_URL =
  process.env.MUX_STREAM_BASE_URL || 'https://stream.mux.com/'

type ProcessingResult = 'updated' | 'skipped' | 'error'

interface VariantWithMux {
  id: string
  hls: string | null
  muxVideoId: string | null
  muxVideo: {
    id: string
    assetId: string | null
    playbackId: string | null
    readyToStream: boolean
  } | null
}

function buildMuxHlsUrl(playbackId: string): string {
  return `${MUX_STREAM_BASE_URL}${playbackId}.m3u8`
}

async function resolvePlaybackId(variant: VariantWithMux): Promise<string | null> {
  if (!variant.muxVideo) {
    return null
  }

  if (variant.muxVideo.playbackId) {
    return variant.muxVideo.playbackId
  }

  if (!variant.muxVideo.assetId) {
    return null
  }

  const muxAsset = await getVideo(variant.muxVideo.assetId, false)
  if (muxAsset.status !== 'ready') {
    return null
  }

  const playbackId = muxAsset.playback_ids?.[0]?.id ?? null
  if (!playbackId) {
    return null
  }

  await prisma.muxVideo.update({
    where: { id: variant.muxVideo.id },
    data: {
      playbackId,
      readyToStream: true,
      duration: Math.ceil(muxAsset.duration ?? 0)
    }
  })

  return playbackId
}

async function processVariant(variant: VariantWithMux): Promise<ProcessingResult> {
  try {
    const playbackId = await resolvePlaybackId(variant)
    if (!playbackId) {
      console.warn(
        `Skipping variant ${variant.id}: unable to resolve playbackId from muxVideoId ${variant.muxVideoId}`
      )
      return 'skipped'
    }

    const nextHls = buildMuxHlsUrl(playbackId)
    if (variant.hls === nextHls) {
      return 'skipped'
    }

    await prisma.videoVariant.update({
      where: { id: variant.id },
      data: { hls: nextHls }
    })

    console.log(`Updated ${variant.id} -> ${nextHls}`)
    return 'updated'
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Error processing variant ${variant.id}: ${message}`)
    return 'error'
  }
}

async function main(): Promise<void> {
  console.log('Starting arc.gt hls repair from Mux...')
  console.log(`Filter: hls contains "${ARC_GT_MATCH}" and muxVideoId is not null`)

  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0
  let scannedCount = 0

  while (true) {
    const variants = await prisma.videoVariant.findMany({
      where: {
        hls: {
          contains: ARC_GT_MATCH
        },
        muxVideoId: {
          not: null
        }
      },
      select: {
        id: true,
        hls: true,
        muxVideoId: true,
        muxVideo: {
          select: {
            id: true,
            assetId: true,
            playbackId: true,
            readyToStream: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      },
      take: BATCH_SIZE
    })

    if (variants.length === 0) {
      break
    }

    for (const variant of variants) {
      scannedCount++
      const result = await processVariant(variant)
      if (result === 'updated') updatedCount++
      if (result === 'skipped') skippedCount++
      if (result === 'error') errorCount++
    }

    console.log(
      `Progress: scanned=${scannedCount} updated=${updatedCount} skipped=${skippedCount} errors=${errorCount}`
    )
  }

  console.log('Arc.gt hls repair complete.')
  console.log(
    `Final counts: scanned=${scannedCount} updated=${updatedCount} skipped=${skippedCount} errors=${errorCount}`
  )
}

if (require.main === module) {
  void main()
    .catch((error) => {
      console.error('Script failed:', error)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
