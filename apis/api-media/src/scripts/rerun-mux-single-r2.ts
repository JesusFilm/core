/**
 * Rerun mux upload and videoVariant update for a single R2 asset.
 *
 * Usage (from repo root):
 *   npx nx run api-media:rerun-mux-single-r2 -- 0412e1cf-29f1-4e3d-85fb-2a53576a6977
 * Or with explicit publicUrl:
 *   npx nx run api-media:rerun-mux-single-r2 -- 0412e1cf-29f1-4e3d-85fb-2a53576a6977 "https://api-media-core.jesusfilm.org/..."
 *
 * Or run directly:
 *   pnpm exec ts-node -r dotenv/config apis/api-media/src/scripts/rerun-mux-single-r2.ts <r2AssetId> [publicUrl]
 */

import { PrismaClient } from '.prisma/api-media-client'

import { createVideoFromUrl, deleteVideo, getVideo } from '../schema/mux/video/service'

const prisma = new PrismaClient()

const MUX_POLL_INTERVAL_MS = 5000
const MUX_POLL_MAX_ATTEMPTS = 120 // 10 minutes

async function main(): Promise<void> {
  const r2AssetId = process.argv[2]
  if (!r2AssetId) {
    console.error('Usage: rerun-mux-single-r2.ts <r2AssetId> [publicUrl]')
    process.exitCode = 1
    return
  }

  let publicUrl = process.argv[3]
  if (!publicUrl) {
    const r2 = await prisma.cloudflareR2.findUnique({
      where: { id: r2AssetId },
      select: { publicUrl: true, originalFilename: true, videoId: true }
    })
    if (!r2?.publicUrl) {
      console.error(`R2 asset not found or missing publicUrl: ${r2AssetId}`)
      process.exitCode = 1
      return
    }
    publicUrl = r2.publicUrl
    console.log(`Using publicUrl from DB: ${publicUrl}`)
  }

  const variant = await prisma.videoVariant.findFirst({
    where: { assetId: r2AssetId },
    include: { muxVideo: true }
  })

  if (!variant) {
    console.error(`No VideoVariant found with assetId=${r2AssetId}`)
    process.exitCode = 1
    return
  }

  console.log(
    `Variant: ${variant.id} (videoId=${variant.videoId}, languageId=${variant.languageId})`
  )

  const oldMuxVideoId = variant.muxVideoId
  const oldMuxAssetId = variant.muxVideo?.assetId ?? null

  if (oldMuxVideoId && oldMuxAssetId) {
    console.log(
      `Removing existing Mux: muxVideoId=${oldMuxVideoId}, assetId=${oldMuxAssetId}`
    )
    try {
      await deleteVideo(oldMuxAssetId, false)
    } catch (e) {
      console.warn(
        'Could not delete old Mux asset (may already be gone):',
        (e as Error).message
      )
    }
    await prisma.videoVariant.update({
      where: { id: variant.id },
      data: { muxVideoId: null }
    })
    await prisma.muxVideo.delete({ where: { id: oldMuxVideoId } }).catch(() => {})
  }

  console.log('Creating Mux asset from URL...')
  const muxAsset = await createVideoFromUrl(publicUrl, false, '2160p', true)
  const newMuxAssetId = muxAsset.id

  const muxVideo = await prisma.muxVideo.create({
    data: {
      assetId: newMuxAssetId,
      userId: 'system',
      downloadable: true
    }
  })

  await prisma.videoVariant.update({
    where: { id: variant.id },
    data: { muxVideoId: muxVideo.id }
  })

  console.log(
    `Mux asset created: assetId=${newMuxAssetId}, muxVideoId=${muxVideo.id}`
  )
  console.log('Waiting for Mux to be ready...')

  let asset: Awaited<ReturnType<typeof getVideo>> | null = null
  for (let i = 0; i < MUX_POLL_MAX_ATTEMPTS; i++) {
    asset = await getVideo(newMuxAssetId, false)
    if (asset.status === 'ready') break
    if (asset.status === 'errored') {
      console.error('Mux asset errored:', asset.errors ?? asset.error)
      process.exitCode = 1
      return
    }
    await new Promise((r) => setTimeout(r, MUX_POLL_INTERVAL_MS))
  }

  if (!asset || asset.status !== 'ready') {
    console.error('Mux asset did not become ready in time')
    process.exitCode = 1
    return
  }

  const playbackId = asset.playback_ids?.[0]?.id
  if (!playbackId) {
    console.error('Mux asset ready but no playback_id')
    process.exitCode = 1
    return
  }

  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL ?? 'https://stream.mux.com/'
  const watchPageBaseUrl =
    process.env.WATCH_PAGE_BASE_URL ?? 'http://jesusfilm.org/watch/'

  await prisma.muxVideo.update({
    where: { id: muxVideo.id },
    data: {
      playbackId,
      readyToStream: true,
      duration: Math.ceil(asset.duration ?? 0),
      downloadable: true
    }
  })

  await prisma.videoVariant.update({
    where: { id: variant.id },
    data: {
      hls: `${muxStreamBaseUrl}${playbackId}.m3u8`,
      share: `${watchPageBaseUrl}${variant.slug}`,
      brightcoveId: null,
      published: true,
      downloadable: true
    }
  })

  console.log('Done. VideoVariant updated with HLS and Mux playback.')
  console.log(`  HLS: ${muxStreamBaseUrl}${playbackId}.m3u8`)
}

if (require.main === module) {
  void main()
    .catch((e) => {
      console.error(e)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
