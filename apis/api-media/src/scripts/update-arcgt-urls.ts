import {
  PrismaClient,
  VideoVariantDownloadQuality
} from '.prisma/api-media-client'

const prisma = new PrismaClient()

// Target qualities to update
const TARGET_QUALITIES: VideoVariantDownloadQuality[] = [
  VideoVariantDownloadQuality.distroLow,
  VideoVariantDownloadQuality.distroSd,
  VideoVariantDownloadQuality.distroHigh
]

const BATCH_SIZE = 1000
const OLD_URL_PREFIX = 'https://arc.gt'
const NEW_URL_PREFIX = 'https://api-v1.arclight.org'

/**
 * Updates URLs in VideoVariantDownload from https://arc.gt to https://api-v1.arclight.org
 * for distroLow, distroSd, and distroHigh qualities
 */
async function updateArcGtUrls(): Promise<void> {
  console.log('Starting URL update for arc.gt -> api-v1.arclight.org...')
  console.log(`Target qualities: ${TARGET_QUALITIES.join(', ')}`)

  try {
    // Get initial count of downloads that need updating
    let remainingCount = await prisma.videoVariantDownload.count({
      where: {
        quality: {
          in: TARGET_QUALITIES
        },
        url: {
          startsWith: OLD_URL_PREFIX
        }
      }
    })

    console.log(`Found ${remainingCount} downloads to update`)

    if (remainingCount === 0) {
      console.log('No downloads found to update. Exiting.')
      return
    }

    let totalUpdated = 0
    let batchNumber = 1

    // Process in batches until no more records need updating
    while (remainingCount > 0) {
      console.log(`Processing batch ${batchNumber}...`)

      // Get batch of downloads to update (always take from the beginning since we're updating records)
      const downloads = await prisma.videoVariantDownload.findMany({
        where: {
          quality: {
            in: TARGET_QUALITIES
          },
          url: {
            startsWith: OLD_URL_PREFIX
          }
        },
        take: BATCH_SIZE,
        orderBy: {
          id: 'asc'
        }
      })

      if (downloads.length === 0) {
        break
      }

      // Update URLs in batch
      for (const download of downloads) {
        const newUrl = download.url.replace(OLD_URL_PREFIX, NEW_URL_PREFIX)

        await prisma.videoVariantDownload.update({
          where: { id: download.id },
          data: { url: newUrl }
        })

        totalUpdated++

        if (totalUpdated % 100 === 0) {
          console.log(`Updated ${totalUpdated} URLs so far...`)
        }
      }

      // Get updated count of remaining downloads
      remainingCount = await prisma.videoVariantDownload.count({
        where: {
          quality: {
            in: TARGET_QUALITIES
          },
          url: {
            startsWith: OLD_URL_PREFIX
          }
        }
      })

      console.log(
        `Batch ${batchNumber} complete. ${remainingCount} downloads remaining.`
      )
      batchNumber++
    }

    console.log('\n=== Update Complete ===')
    console.log(`Total updated: ${totalUpdated}`)
    console.log(`URLs changed from: ${OLD_URL_PREFIX}`)
    console.log(`URLs changed to: ${NEW_URL_PREFIX}`)
  } catch (error) {
    console.error('Error updating arc.gt URLs:', error)
    throw error
  }
}

/**
 * Main function to run the script
 */
async function main(): Promise<void> {
  try {
    await updateArcGtUrls()
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

export { updateArcGtUrls }
