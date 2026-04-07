/**
 * Script to find video variants for a given videoId and add them to Algolia.
 * Note: The languageId filter is currently commented out/disabled.
 *
 * Usage: npx tsx src/scripts/add-video-variants-to-algolia.ts
 */

import { prisma } from '@core/prisma/media/client'

import {
  getAlgoliaClient,
  getAlgoliaConfig
} from '../../lib/algolia/algoliaClient'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate/algoliaVideoVariantUpdate'

async function main(): Promise<void> {
  // SET DESIRED FILTERS HERE
  const targetVideoIds = ['15_TrueMerit']
  // const targetLanguageIds = ['176243']

  console.log(
    `🚀 Finding video variants for targetVideoIds: ${targetVideoIds.join(', ')}`
  )

  // Find all video variants for the target video ids
  const videoVariants = await prisma.videoVariant.findMany({
    where: {
      videoId: { in: targetVideoIds }
    },
    select: {
      id: true,
      videoId: true,
      languageId: true,
      published: true
    }
  })

  console.log(`📊 Found ${videoVariants.length} video variants`)

  if (videoVariants.length === 0) {
    console.log('ℹ️ No video variants found with the specified videoId')
    return
  }

  // Algolia is required for this script. These will throw if misconfigured.
  const client = getAlgoliaClient()
  const { videoVariantsIndex } = getAlgoliaConfig()

  // Check Algolia for presence of each variant as an object (objectID === videoVariant.id)
  const ids: string[] = videoVariants.map((v) => v.id)
  const results: PromiseSettledResult<unknown>[] = await Promise.allSettled(
    ids.map((id) =>
      // In our indexing, objectID === videoVariant.id
      client.getObject({ indexName: videoVariantsIndex, objectID: id })
    )
  )
  const missingIds: string[] = []
  let presentCount = 0
  results.forEach((res, idx) => {
    if (res.status === 'fulfilled') presentCount++
    else missingIds.push(ids[idx])
  })
  console.log(
    `🔍 Algolia presence: ${presentCount} present, ${missingIds.length} missing`
  )
  if (missingIds.length > 0) {
    console.log(`🧭 Missing in Algolia: ${missingIds.join(', ')}`)
  }

  // Update all variants regardless of presence check results
  console.log('🛠️ Updating all found variants.')
  let successCount = 0
  let errorCount = 0
  for (let i = 0; i < videoVariants.length; i++) {
    const variant = videoVariants[i]
    try {
      console.log(
        `🛠️ Updating variant ${i + 1}/${videoVariants.length}: ${variant.id} (videoId=${variant.videoId}, languageId=${variant.languageId}, published=${variant.published})`
      )
      await updateVideoVariantInAlgolia(variant.id)
      console.log(`✅ Updated ${variant.id}`)
      successCount++
    } catch (error) {
      console.error(`❌ Failed to update ${variant.id}`, error)
      errorCount++
    }
  }
  console.log(`🎉 Update complete.`)
  console.log(`✅ Successfully updated: ${successCount}`)
  console.log(`❌ Failed to update: ${errorCount}`)
  console.log(`📊 Total processed: ${videoVariants.length} variants`)
}

// Run the script if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}
