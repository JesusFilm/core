/**
 * Script to add hasAvailableLanguages field to all videos in Algolia
 *
 * Usage: npx tsx src/scripts/add-algolia-field.ts
 */

import { prisma } from '@core/prisma/media/client'

import {
  getAlgoliaClient,
  getAlgoliaConfig
} from '../../lib/algolia/algoliaClient'

// Helper script to used to add hasAvailableLanguages field to all videos in Algolia
// Could be used to add any field to the index
async function main(): Promise<void> {
  console.log('🚀 Adding hasAvailableLanguages to videos index...')
  // Algolia is required for this script. These will throw if misconfigured.
  const client = getAlgoliaClient()
  const { videosIndex } = getAlgoliaConfig()
  console.log(`📋 Using Algolia index: ${videosIndex}`)

  // Get all videos with their hasAvailableLanguages
  const videos = await prisma.video.findMany({
    select: {
      id: true,
      availableLanguages: true
    },
    orderBy: { id: 'asc' }
  })

  console.log(`📊 Found ${videos.length} videos to update`)

  if (videos.length === 0) {
    console.log('ℹ️ No videos found')
    return
  }

  // Process in batches
  const batchSize = 100
  for (let i = 0; i < videos.length; i += batchSize) {
    const batch = videos.slice(i, i + batchSize)

    const updates = batch.map((video) => {
      if (video.availableLanguages.length === 0) {
        console.log(`❌ Video ${video.id} has no available languages`)
      }
      return {
        objectID: video.id,
        hasAvailableLanguages: video.availableLanguages.length > 0
      }
    })

    await client.partialUpdateObjects({
      indexName: videosIndex,
      objects: updates,
      waitForTasks: true
    })

    console.log(
      `✅ Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(videos.length / batchSize)} (${batch.length} records)`
    )
  }

  console.log(
    `🎉 Successfully updated ${videos.length} videos with hasAvailableLanguages`
  )
}

// Run the script if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}
