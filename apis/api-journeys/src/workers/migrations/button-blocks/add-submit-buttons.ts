import { v4 as uuidv4 } from 'uuid'

import { PrismaClient } from '.prisma/api-journeys-client'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../app/__generated__/graphql'

const prisma = new PrismaClient()

interface Stats {
  cardsModified: number
  buttonsAdded: number
  iconsAdded: number
  startTime: number
}

async function main(): Promise<void> {
  const stats: Stats = {
    cardsModified: 0,
    buttonsAdded: 0,
    iconsAdded: 0,
    startTime: Date.now()
  }

  try {
    console.log('Starting migration...')
    // Get all cards that have child blocks
    const limit = 100
    let offset = 0
    let hasMore = true
    while (hasMore) {
      const cards = await prisma.block.findMany({
        where: {
          AND: [
            { typename: 'CardBlock' },
            {
              childBlocks: {
                some: {
                  typename: 'TextResponseBlock'
                }
              }
            },
            {
              childBlocks: {
                none: {
                  typename: 'ButtonBlock'
                }
              }
            }
          ]
        },
        skip: offset,
        take: limit,
        include: {
          childBlocks: {
            where: {
              deletedAt: null
            }
          }
        }
      })
      if (cards.length < limit) {
        hasMore = false
      }
      offset += limit
      console.log(`Found ${cards.length} cards with child blocks`)

      for (const card of cards) {
        console.log(`Processing card ${card.id}`)

        // Create block IDs
        const buttonId = uuidv4()
        const startIconId = uuidv4()
        const endIconId = uuidv4()

        // Define the blocks
        const startIcon = {
          id: startIconId,
          journeyId: card.journeyId,
          typename: 'IconBlock',
          parentBlockId: buttonId
        }

        const endIcon = {
          id: endIconId,
          journeyId: card.journeyId,
          typename: 'IconBlock',
          parentBlockId: buttonId
        }

        const button = {
          id: buttonId,
          journeyId: card.journeyId,
          typename: 'ButtonBlock',
          parentBlockId: card.id,
          parentOrder: card.childBlocks.length,
          label: '',
          variant: ButtonVariant.contained,
          color: ButtonColor.primary,
          size: ButtonSize.medium,
          submitEnabled: true,
          startIconId,
          endIconId
        }

        // Create all blocks at once
        await prisma.block.createMany({
          data: [startIcon, endIcon, button]
        })

        console.log(`Created button ${buttonId} with icons for card ${card.id}`)

        stats.cardsModified++
        stats.buttonsAdded++
        stats.iconsAdded += 2
      }
    }
    const executionTime = (Date.now() - stats.startTime) / 1000 // Convert to seconds

    // Log summary
    console.log('\nMigration completed successfully!')
    console.log('Summary:')
    console.log(`- Cards modified: ${stats.cardsModified}`)
    console.log(`- Submit buttons added: ${stats.buttonsAdded}`)
    console.log(`- Icons added: ${stats.iconsAdded}`)
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
