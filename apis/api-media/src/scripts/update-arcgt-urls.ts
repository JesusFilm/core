import { VideoVariantDownloadQuality } from '.prisma/api-media-client'

import { prisma } from '../lib/prisma'

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
    // Get count of downloads that need updating
    const totalCount = await prisma.videoVariantDownload.count({
      where: {
        quality: {
          in: TARGET_QUALITIES
        },
        url: {
          startsWith: OLD_URL_PREFIX
        }
      }
    })

    console.log(`Found ${totalCount} downloads to update`)

    if (totalCount === 0) {
      console.log('No downloads found to update. Exiting.')
      return
    }

    let processed = 0
    let updated = 0

    // Process in batches
    while (processed < totalCount) {
      console.log(
        `Processing batch ${Math.floor(processed / BATCH_SIZE) + 1}...`
      )

      // Get batch of downloads to update
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
        skip: processed,
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

        updated++

        if (updated % 100 === 0) {
          console.log(`Updated ${updated} URLs so far...`)
        }
      }

      processed += downloads.length
      console.log(`Progress: ${processed}/${totalCount} downloads processed`)
    }

    console.log('\n=== Update Complete ===')
    console.log(`Total processed: ${processed}`)
    console.log(`Total updated: ${updated}`)
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
