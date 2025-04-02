import { Block } from '.prisma/api-journeys-client'

import { prisma } from '../../../../lib/prisma'

// Function to get button blocks in batches
async function* getButtonBlocksInBatches(): AsyncGenerator<Block[]> {
  let page = 0
  const batchSize = 1000
  let skip = 0
  let buttonBlocks: Block[] = []

  // Get first batch
  console.log(`Fetching button blocks - page: ${page}`)
  buttonBlocks = await prisma.block.findMany({
    where: {
      typename: 'ButtonBlock',
      submitEnabled: null
    },
    skip,
    take: batchSize
  })
  page++
  skip += batchSize
  yield buttonBlocks

  // Continue fetching batches until no more results
  while (buttonBlocks.length > 0) {
    console.log(`Fetching button blocks - page: ${page}`)
    buttonBlocks = await prisma.block.findMany({
      where: {
        typename: 'ButtonBlock',
        submitEnabled: null
      },
      skip,
      take: batchSize
    })
    page++
    skip += batchSize
    yield buttonBlocks
  }
}

// Main function to handle the migration
async function migrateButtonBlocks(): Promise<void> {
  console.log('Starting Button Blocks migration...')

  // Get total count for progress tracking
  const totalCount = await prisma.block.count({
    where: {
      typename: 'ButtonBlock',
      submitEnabled: null
    }
  })
  console.log(`Found ${totalCount} button blocks with submitEnabled: null`)

  // If no blocks need updating, exit early
  if (totalCount === 0) {
    console.log('No button blocks need updating. Migration complete!')
    return
  }

  // Process in batches
  let processedCount = 0
  const generator = getButtonBlocksInBatches()

  for await (const batch of generator) {
    // Skip processing if batch is empty
    if (batch.length === 0) continue

    // Extract IDs for updating
    const blockIds = batch.map((block) => block.id)

    // Update all blocks in this batch
    const updateResult = await prisma.block.updateMany({
      where: {
        id: { in: blockIds }
      },
      data: {
        submitEnabled: true
      }
    })

    // Update progress counter and log
    processedCount += batch.length
    console.log(
      `Updated ${batch.length} blocks (${processedCount}/${totalCount})`
    )
  }

  console.log('Button Blocks migration completed successfully!')
  console.log(`Total button blocks updated: ${processedCount}`)
}

// Main execution function
async function main(): Promise<void> {
  try {
    console.log(
      'Starting migration to set submitEnabled field for Button blocks'
    )
    await migrateButtonBlocks()
    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed with error:', error)
    process.exit(1)
  }
}

// Execute the script
main()
  .catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
  .finally(async () => {
    // Close the Prisma client connection
    await prisma.$disconnect()
  })
