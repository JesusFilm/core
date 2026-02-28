import Mux from '@mux/mux-node'

import {
  PrismaClient,
  VideoVariantDownloadQuality
} from '.prisma/api-media-client'

const prisma = new PrismaClient()

const BATCH_SIZE = 100
const MUX_URL_PREFIX = 'https://stream.mux.com/'
const RATE_LIMIT_DELAY_MS = 3000

const QUALITY_TO_RESOLUTION: Record<string, string> = {
  [VideoVariantDownloadQuality.low]: '270p',
  [VideoVariantDownloadQuality.sd]: '360p',
  [VideoVariantDownloadQuality.high]: '720p',
  [VideoVariantDownloadQuality.fhd]: '1080p',
  [VideoVariantDownloadQuality.qhd]: '1440p',
  [VideoVariantDownloadQuality.uhd]: '2160p'
}

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

function resolveResolution(
  quality: VideoVariantDownloadQuality,
  url: string,
  staticFiles: Array<{ resolution?: string }>
): string | null {
  const fromUrl = url.match(/\/(\d+p)\.mp4$/)?.[1]
  if (fromUrl != null) return fromUrl

  if (quality === VideoVariantDownloadQuality.highest) {
    const highest = [...staticFiles]
      .filter((f) => f.resolution != null)
      .sort(
        (a, b) =>
          parseInt(b.resolution!.replace('p', '')) -
          parseInt(a.resolution!.replace('p', ''))
      )[0]
    return highest?.resolution ?? null
  }

  return QUALITY_TO_RESOLUTION[quality] ?? null
}

export async function updateMuxDownloadUrls(mux: Mux): Promise<void> {
  console.log('Starting Mux download URL update...')
  console.log('Targeting downloads with non-Mux URLs\n')

  let totalUpdated = 0
  let totalSkipped = 0
  let totalErrors = 0
  let totalVariantsProcessed = 0
  let cursor: string | undefined
  let hasMore = true

  while (hasMore) {
    const variants = await prisma.videoVariant.findMany({
      where: {
        muxVideoId: { not: null },
        muxVideo: {
          assetId: { not: null }
        },
        downloads: {
          some: {
            url: { not: { startsWith: MUX_URL_PREFIX } },
            quality: {
              notIn: ['distroLow', 'distroSd', 'distroHigh']
            }
          }
        }
      },
      include: {
        muxVideo: true,
        downloads: {
          where: {
            url: { not: { startsWith: MUX_URL_PREFIX } },
            quality: {
              notIn: ['distroLow', 'distroSd', 'distroHigh']
            }
          }
        }
      },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor != null ? { cursor: { id: cursor }, skip: 1 } : {})
    })

    if (variants.length === 0) {
      hasMore = false
      break
    }

    cursor = variants[variants.length - 1].id

    console.log(
      `Processing batch of ${variants.length} variants (cursor: ${cursor})...`
    )

    for (const variant of variants) {
      if (variant.muxVideo?.assetId == null) continue

      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY_MS))

      let muxAsset: Mux.Video.Asset
      try {
        muxAsset = await mux.video.assets.retrieve(variant.muxVideo.assetId)
      } catch (error) {
        console.error(
          `Failed to retrieve Mux asset ${variant.muxVideo.assetId} for variant ${variant.id}: ${error instanceof Error ? error.message : error}`
        )
        totalErrors++
        continue
      }

      const currentPlaybackId = muxAsset.playback_ids?.[0]?.id
      if (currentPlaybackId == null) {
        console.log(
          `No playback ID found for variant ${variant.id} (asset ${variant.muxVideo.assetId}), skipping`
        )
        totalSkipped += variant.downloads.length
        continue
      }

      const staticFiles = muxAsset.static_renditions?.files ?? []

      for (const download of variant.downloads) {
        const resolution = resolveResolution(
          download.quality,
          download.url,
          staticFiles
        )

        if (resolution == null) {
          console.log(
            `Could not determine resolution for download ${download.id} (quality: ${download.quality}, url: ${download.url}), skipping`
          )
          totalSkipped++
          continue
        }

        const correctUrl = `${MUX_URL_PREFIX}${currentPlaybackId}/${resolution}.mp4`

        const renditionFile = staticFiles.find(
          (f) => f.resolution === resolution
        )

        const updateData: {
          url: string
          size?: number
          height?: number
          width?: number
          bitrate?: number
        } = { url: correctUrl }

        if (renditionFile != null) {
          if (renditionFile.filesize != null)
            updateData.size = parseInt(renditionFile.filesize)
          if (renditionFile.height != null)
            updateData.height = renditionFile.height
          if (renditionFile.width != null) updateData.width = renditionFile.width
          if (renditionFile.bitrate != null)
            updateData.bitrate = renditionFile.bitrate
        }

        try {
          await prisma.videoVariantDownload.update({
            where: { id: download.id },
            data: updateData
          })

          console.log(
            `Updated download ${download.id} (${download.quality}): ${download.url} -> ${correctUrl}`
          )
          totalUpdated++
        } catch (error) {
          console.error(
            `Failed to update download ${download.id}: ${error instanceof Error ? error.message : error}`
          )
          totalErrors++
        }
      }

      totalVariantsProcessed++
    }
  }

  console.log('\n=== Mux Download URL Update Complete ===')
  console.log(`Variants processed: ${totalVariantsProcessed}`)
  console.log(`Downloads updated:  ${totalUpdated}`)
  console.log(`Downloads skipped:  ${totalSkipped}`)
  console.log(`Errors:             ${totalErrors}`)
}

async function main(): Promise<void> {
  try {
    const mux = getMuxClient()
    await updateMuxDownloadUrls(mux)
    console.log('Script completed successfully!')
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}
