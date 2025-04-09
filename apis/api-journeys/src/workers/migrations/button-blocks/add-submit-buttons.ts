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
}

async function main(): Promise<void> {
  const stats: Stats = {
    cardsModified: 0,
    buttonsAdded: 0
  }

  try {
    // Get all cards that have child blocks
    const cards = await prisma.block.findMany({
      where: {
        typename: 'CardBlock',
        childBlocks: {
          some: {} // Has at least one child block
        }
      },
      include: {
        childBlocks: true // Include child blocks to check their types
      }
    })

    for (const card of cards) {
      // Check if card has text response block but no button
      const hasTextResponse = card.childBlocks.some(
        (block) => block.typename === 'TextResponseBlock'
      )
      const hasButton = card.childBlocks.some(
        (block) => block.typename === 'ButtonBlock'
      )

      if (hasTextResponse && !hasButton) {
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
          submitEnabled: true
        }

        // Create all blocks at once
        await prisma.block.createMany({
          data: [startIcon, endIcon, button]
        })

        // Update button with icon references
        await prisma.block.update({
          where: { id: buttonId },
          data: {
            startIconId,
            endIconId
          }
        })

        stats.cardsModified++
        stats.buttonsAdded++
      }
    }

    // Log summary
    console.log('Migration completed successfully!')
    console.log('Summary:')
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
