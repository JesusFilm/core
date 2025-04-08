import { v4 as uuidv4 } from 'uuid'

import { PrismaClient } from '.prisma/api-journeys-client'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../app/__generated__/graphql'

const prisma = new PrismaClient()

interface Stats {
  journeysProcessed: number
  cardsModified: number
  buttonsAdded: number
}

async function main(): Promise<void> {
  const stats: Stats = {
    journeysProcessed: 0,
    cardsModified: 0,
    buttonsAdded: 0
  }

  try {
    // Get all journeys with their blocks
    const journeys = await prisma.journey.findMany({
      include: {
        blocks: true
      }
    })

    stats.journeysProcessed = journeys.length

    for (const journey of journeys) {
      // Get all cards in the journey
      const cards = journey.blocks.filter(
        (block) => block.typename === 'CardBlock'
      )

      for (const card of cards) {
        // Get all blocks in this card
        const cardBlocks = journey.blocks.filter(
          (block) => block.parentBlockId === card.id
        )

        // Check if card has text response block but no button
        const hasTextResponse = cardBlocks.some(
          (block) => block.typename === 'TextResponseBlock'
        )
        const hasButton = cardBlocks.some(
          (block) => block.typename === 'ButtonBlock'
        )

        if (hasTextResponse && !hasButton) {
          // Create new button block
          const button = {
            id: uuidv4(),
            journeyId: journey.id,
            typename: 'ButtonBlock',
            parentBlockId: card.id,
            parentOrder: cardBlocks.length,
            label: '',
            variant: ButtonVariant.contained,
            color: ButtonColor.primary,
            size: ButtonSize.medium,
            startIconId: uuidv4(),
            endIconId: uuidv4(),
            action: null,
            submitEnabled: true
          }

          // Add button to database
          await prisma.block.create({
            data: button
          })

          stats.cardsModified++
          stats.buttonsAdded++
        }
      }
    }

    // Log summary
    console.log('Migration completed successfully!')
    console.log('Summary:')
    console.log(`- Journeys processed: ${stats.journeysProcessed}`)
    console.log(`- Cards modified: ${stats.cardsModified}`)
    console.log(`- Submit buttons added: ${stats.buttonsAdded}`)
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
