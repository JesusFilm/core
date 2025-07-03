import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prisma } from '../lib/prisma'

// Quality mapping from regular to distro
const QUALITY_MAPPING: Record<
  VideoVariantDownloadQuality,
  VideoVariantDownloadQuality
> = {
  low: VideoVariantDownloadQuality.distroLow,
  sd: VideoVariantDownloadQuality.distroSd,
  high: VideoVariantDownloadQuality.distroHigh,
  // These don't have distro equivalents, so we skip them
  highest: VideoVariantDownloadQuality.highest,
  distroLow: VideoVariantDownloadQuality.distroLow,
  distroSd: VideoVariantDownloadQuality.distroSd,
  distroHigh: VideoVariantDownloadQuality.distroHigh
}

const BATCH_SIZE = 1000

/**
 * Copies existing VideoVariantDownloads to their matched distro downloads
 * Maps: low -> distroLow, sd -> distroSd, high -> distroHigh
 */
async function copyToDistroDownloads(): Promise<void> {
  console.log('Starting copy of VideoVariantDownloads to distro downloads...')

  try {
    // Get count of downloads that need copying
    const totalCount = await prisma.videoVariantDownload.count({
      where: {
        quality: {
          in: [
            VideoVariantDownloadQuality.low,
            VideoVariantDownloadQuality.sd,
            VideoVariantDownloadQuality.high
          ]
        }
      }
    })

    console.log(`Found ${totalCount} downloads to copy`)

    if (totalCount === 0) {
      console.log('No downloads found to copy. Exiting.')
      return
    }

    let processed = 0
    let created = 0
    let skipped = 0

    // Process in batches
    while (processed < totalCount) {
      console.log(
        `Processing batch ${Math.floor(processed / BATCH_SIZE) + 1}...`
      )

      // Get batch of downloads to copy
      const downloads = await prisma.videoVariantDownload.findMany({
        where: {
          quality: {
            in: [
              VideoVariantDownloadQuality.low,
              VideoVariantDownloadQuality.sd,
              VideoVariantDownloadQuality.high
            ]
          }
        },
        take: BATCH_SIZE,
        skip: processed,
        orderBy: {
          id: 'asc'
        }
      })

      if (downloads.length === 0) {
        break
      }

      // Prepare batch inserts
      const distroDownloads = []

      for (const download of downloads) {
        const distroQuality = QUALITY_MAPPING[download.quality]

        // Skip if no distro equivalent (shouldn't happen with our filter, but safety check)
        if (!distroQuality || distroQuality === download.quality) {
          skipped++
          continue
        }

        // Prepare distro download data
        distroDownloads.push({
          quality: distroQuality,
          size: download.size,
          height: download.height,
          width: download.width,
          bitrate: download.bitrate,
          version: download.version,
          url: download.url,
          assetId: download.assetId,
          videoVariantId: download.videoVariantId
        })
      }

      // Batch insert distro downloads
      if (distroDownloads.length > 0) {
        await prisma.videoVariantDownload.createMany({
          data: distroDownloads,
          skipDuplicates: true
        })
        created += distroDownloads.length
        console.log(
          `Created ${distroDownloads.length} distro downloads in this batch`
        )
      }

      processed += downloads.length
      console.log(`Progress: ${processed}/${totalCount} downloads processed`)
    }

    console.log('\n=== Copy Complete ===')
    console.log(`Total processed: ${processed}`)
    console.log(`Total created: ${created}`)
    console.log(`Total skipped: ${skipped}`)
  } catch (error) {
    console.error('Error copying distro downloads:', error)
    throw error
  }
}

/**
 * Main function to run the script
 */
async function main(): Promise<void> {
  try {
    await copyToDistroDownloads()
    console.log('Script completed successfully!')
  } catch (error) {
    console.error('Script failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script if called directly
if (require.main === module) {
  void main()
}

export { copyToDistroDownloads }
