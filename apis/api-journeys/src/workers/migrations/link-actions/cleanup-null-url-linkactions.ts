import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

async function deleteNullUrlLinkActions(): Promise<void> {
  const journeyId = '845f9f07-de8f-4a3c-8313-761844788abb' // the "Change is Possible. template"

  // First, verify the journey exists
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: { id: true, title: true }
  })

  if (!journey) {
    console.error(`Journey with ID ${journeyId} not found`)
    return
  }

  console.log(`Processing journey: ${journey.title} (${journey.id})`)

  // Find all blocks in this journey that have LinkActions with null URLs
  const blocksWithNullUrlLinkActions = await prisma.block.findMany({
    where: {
      journeyId: journeyId,
      action: {
        url: null,
        // This ensures we only get LinkActions (not EmailActions, etc.)
        email: null,
        phone: null,
        blockId: null
      }
    },
    include: {
      action: true
    }
  })

  console.log(
    `Found ${blocksWithNullUrlLinkActions.length} blocks with null URL LinkActions`
  )

  // Log what we're about to delete
  blocksWithNullUrlLinkActions.forEach((block) => {
    console.log(
      `Block ID: ${block.id}, Action ID: ${block.action?.parentBlockId}`
    )
  })

  // Delete the LinkActions with null URLs
  const deleteResult = await prisma.action.deleteMany({
    where: {
      parentBlockId: {
        in: blocksWithNullUrlLinkActions.map((block) => block.id)
      },
      url: null
    }
  })

  console.log(
    `Successfully deleted ${deleteResult.count} LinkActions with null URLs`
  )
}

// Main execution function
async function main(): Promise<void> {
  try {
    console.log('Starting migration to cleanup LinkActions with null URLs')
    await deleteNullUrlLinkActions()
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
