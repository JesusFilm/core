import { PrismaClient } from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

interface Stats {
  cardsModified: number
  buttonsUpdated: number
  iconsAdded: number
  startTime: number
}

async function main(): Promise<void> {
  const stats: Stats = {
    cardsModified: 0,
    buttonsUpdated: 0,
    iconsAdded: 0,
    startTime: Date.now()
  }

  try {
    console.log('Starting migration...')
    // Get all cards that have child blocks
    const limit = 100
    let hasMore = true
    while (hasMore) {
      const cards = await prisma.block.findMany({
        where: {
          typename: 'CardBlock',
          deletedAt: null,
          childBlocks: {
            none: { typename: 'TextResponseBlock', deletedAt: null },
            some: {
              typename: 'ButtonBlock',
              submitEnabled: true,
              deletedAt: null
            }
          }
        },
        take: limit,
        include: {
          childBlocks: {
            where: { deletedAt: null }
          }
        }
      })
      if (cards.length < limit) {
        hasMore = false
      }
      console.log(`Found ${cards.length} cards with child blocks`)

      const buttons = cards.flatMap((card) =>
        card.childBlocks.filter(
          (block) =>
            block.typename === 'ButtonBlock' &&
            block.submitEnabled === true &&
            block.deletedAt === null
        )
      )

      for (const button of buttons) {
        console.log(`Processing button ${button.id}`)

        await prisma.block.update({
          where: { id: button.id },
          data: { submitEnabled: false }
        })

        console.log(`Updated button ${button.id}`)
        stats.cardsModified++
        stats.buttonsUpdated++
      }
    }
    const executionTime = (Date.now() - stats.startTime) / 1000 // Convert to seconds

    // Log summary
    console.log('\nMigration completed successfully!')
    console.log('Summary:')
    console.log(`- Cards modified: ${stats.cardsModified}`)
    console.log(`- Submit buttons updated: ${stats.buttonsUpdated}`)
    console.log(`- Execution time: ${executionTime.toFixed(2)} seconds`)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
