import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { CROWDIN_CONFIG } from '../../config'
import { fetchSourceStrings } from '../../importer'

interface CrowdinSourceString {
  id: number
  identifier: string
}

async function fetchCrowdinSourceStrings(
  fileId: number
): Promise<CrowdinSourceString[]> {
  const sourceStrings = await fetchSourceStrings(fileId)

  return sourceStrings
    .map((str) => ({
      id: str.id,
      identifier: str.identifier
    }))
    .filter((str) => {
      return str.identifier && str.identifier.trim().length > 0
    })
}

function findMatchingVideoId(
  identifier: string,
  allVideoIds: string[]
): string | null {
  // Exact match
  if (allVideoIds.includes(identifier)) {
    return identifier
  }

  // Partial match (video ID ends with identifier after underscore)
  const partialMatch = allVideoIds.find((videoId) => {
    const match = videoId.match(/_(.+)$/)
    return match && match[1] === identifier
  })

  return partialMatch || null
}

async function updateVideoTitlesWithCrowdinIds(
  crowdinStrings: CrowdinSourceString[],
  logger?: Logger
): Promise<{ updated: number; skipped: number; errors: number }> {
  let updated = 0
  let skipped = 0
  let errors = 0

  // Get all video IDs for matching
  const allVideos = await prisma.video.findMany({ select: { id: true } })
  const allVideoIds = allVideos.map((v) => v.id)

  for (const crowdinString of crowdinStrings) {
    const matchingVideoId = findMatchingVideoId(
      crowdinString.identifier,
      allVideoIds
    )

    if (!matchingVideoId) {
      logger?.warn(
        `No matching video found for identifier: ${crowdinString.identifier}`
      )
      skipped++
      continue
    }

    // Find records for this video that don't have a Crowdin ID
    const records = await prisma.videoTitle.findMany({
      where: {
        videoId: matchingVideoId,
        crowdInId: null
      }
    })

    if (records.length === 0) {
      logger?.debug(`No title records to update for video: ${matchingVideoId}`)
      skipped++
      continue
    }

    // Update all records for this video
    try {
      await prisma.videoTitle.updateMany({
        where: {
          videoId: matchingVideoId,
          crowdInId: null
        },
        data: {
          crowdInId: crowdinString.id.toString()
        }
      })

      logger?.info(
        `Updated ${records.length} video title records for video ${matchingVideoId} with Crowdin ID: ${crowdinString.id}`
      )
      updated += records.length
    } catch (error) {
      logger?.error(
        `Failed to update video title records for video ${matchingVideoId}:`,
        error
      )
      errors += records.length
    }
  }

  return { updated, skipped, errors }
}

async function updateVideoDescriptionsWithCrowdinIds(
  crowdinStrings: CrowdinSourceString[],
  logger?: Logger
): Promise<{ updated: number; skipped: number; errors: number }> {
  let updated = 0
  let skipped = 0
  let errors = 0

  // Get all video IDs for matching
  const allVideos = await prisma.video.findMany({ select: { id: true } })
  const allVideoIds = allVideos.map((v) => v.id)

  for (const crowdinString of crowdinStrings) {
    const matchingVideoId = findMatchingVideoId(
      crowdinString.identifier,
      allVideoIds
    )

    if (!matchingVideoId) {
      logger?.warn(
        `No matching video found for identifier: ${crowdinString.identifier}`
      )
      skipped++
      continue
    }

    // Find records for this video that don't have a Crowdin ID
    const records = await prisma.videoDescription.findMany({
      where: {
        videoId: matchingVideoId,
        crowdInId: null
      }
    })

    if (records.length === 0) {
      logger?.debug(
        `No description records to update for video: ${matchingVideoId}`
      )
      skipped++
      continue
    }

    // Update all records for this video
    try {
      await prisma.videoDescription.updateMany({
        where: {
          videoId: matchingVideoId,
          crowdInId: null
        },
        data: {
          crowdInId: crowdinString.id.toString()
        }
      })

      logger?.info(
        `Updated ${records.length} video description records for video ${matchingVideoId} with Crowdin ID: ${crowdinString.id}`
      )
      updated += records.length
    } catch (error) {
      logger?.error(
        `Failed to update video description records for video ${matchingVideoId}:`,
        error
      )
      errors += records.length
    }
  }

  return { updated, skipped, errors }
}

export async function populateCrowdinIds(logger?: Logger): Promise<void> {
  logger?.info('Starting Crowdin ID population process')

  try {
    const [
      titleStrings,
      descriptionStrings,
      collectionTitleStrings,
      collectionLongDescriptionStrings
    ] = await Promise.all([
      fetchCrowdinSourceStrings(CROWDIN_CONFIG.files.media_metadata_tile.id),
      fetchCrowdinSourceStrings(
        CROWDIN_CONFIG.files.media_metadata_description.id
      ),
      fetchCrowdinSourceStrings(CROWDIN_CONFIG.files.collection_title.id),
      fetchCrowdinSourceStrings(
        CROWDIN_CONFIG.files.collection_long_description.id
      )
    ])

    logger?.info(
      `Found ${titleStrings.length} title strings and ${descriptionStrings.length} description strings and ${collectionTitleStrings.length} collection title strings and ${collectionLongDescriptionStrings.length} collection long description strings`
    )

    await Promise.all([
      updateVideoTitlesWithCrowdinIds(titleStrings, logger),
      updateVideoDescriptionsWithCrowdinIds(descriptionStrings, logger),
      updateVideoTitlesWithCrowdinIds(collectionTitleStrings, logger),
      updateVideoDescriptionsWithCrowdinIds(
        collectionLongDescriptionStrings,
        logger
      )
    ])

    logger?.info('Crowdin ID population completed')
  } catch (error) {
    logger?.error('Failed to populate Crowdin IDs:', error)
    throw error
  }
}

// CLI execution
if (require.main === module) {
  void (async () => {
    try {
      const { logger } = await import(
        /* webpackChunkName: "logger" */
        '../../../../logger'
      )
      await populateCrowdinIds(logger)
      logger.info('Crowdin ID population completed successfully')
      process.exit(0)
    } catch (error) {
      console.error('Crowdin ID population failed:', error)
      process.exit(1)
    }
  })()
}
