// Migration script to replace Subscribe blocks
import { v4 as uuidv4 } from 'uuid'

import { PrismaClient } from '.prisma/api-journeys-client'

import {
  TextResponseBlock,
  TextResponseType
} from '../../../__generated__/graphql'

// Create a new PrismaClient instance for this script
const prisma = new PrismaClient()

/**
 * Main function to fetch all SignUpBlocks and log them with their parent blocks
 */
async function fetchSignUpBlocks(): Promise<void> {
  try {
    // 1. Query all blocks with typename 'SignUpBlock'
    const signUpBlocks = await prisma.block.findMany({
      where: {
        typename: 'SignUpBlock',
        // journeyId: '4d51d094-fe79-453f-b3b7-2bf897406740',
        deletedAt: null // Only fetch non-deleted blocks
      },
      include: {
        // Include related data that might be useful
        action: true,
        journey: {
          select: {
            id: true,
            title: true
          }
        },
        childBlocks: {
          orderBy: {
            parentOrder: 'asc'
          },
          where: {
            deletedAt: null
          }
        },
      }
    })

    // Log the number of blocks found
    console.log(`Found ${signUpBlocks.length} SignUpBlocks`)

    // Log each block with a formatted output and fetch its parent block
    for (let i = 0; i < signUpBlocks.length; i++) {
      const block = signUpBlocks[i]
      console.log(`\n--- SignUpBlock ${i + 1} ---`, 'journeyId:', block.journeyId)

      // Update the parentOrder of all blocks that have a parentBlockId that matches the current block's parentBlockId
      await prisma.block.updateMany({
        where: {
          parentBlockId: block.parentBlockId,
          id: {
            not: block.id // Exclude the original SignUpBlock
          },
          parentOrder: {
            gt: block.parentOrder ?? 0 // Only update blocks with higher parentOrder
          },
          deletedAt: null // Maintain consistency with your existing queries
        },
        data: {
          parentOrder: {
            increment: 2 // Increment by 4 to make room for the new blocks
          }
        }
      })

      // 2. Insert 2 Text Response Blocks and 1 Button block
      const nameTextResponseBlock: TextResponseBlock = {
        id: uuidv4(),
        __typename: 'TextResponseBlock',
        journeyId: block.journeyId,
        parentBlockId: block.parentBlockId,
        parentOrder: (block.parentOrder ?? 0),
        label: t('Name'),
        minRows: 1,
        type: TextResponseType.Name,
        required: true
      }

      // Create email response block
      const emailTextResponseBlock: TextResponseBlock = {
        id: uuidv4(),
        __typename: 'TextResponseBlock',
        journeyId: block.journeyId,
        parentBlockId: block.parentBlockId,
        parentOrder: (block.parentOrder ?? 0) + 1,
        label: t('Email'),
        minRows: 1,
        type: TextResponseType.Email,
        required: true
      }

      // Create the TextResponseBlock
      await prisma.block.create({
        data: {
          typename: 'TextResponseBlock',
          journeyId: nameTextResponseBlock.journeyId,
          parentBlockId: nameTextResponseBlock.parentBlockId,
          parentOrder: nameTextResponseBlock.parentOrder,
          label: nameTextResponseBlock.label,
          minRows: nameTextResponseBlock.minRows,
          type: nameTextResponseBlock.type,
          required: nameTextResponseBlock.required,
          updatedAt: new Date()
        }
      })

      await prisma.block.create({
        data: {
          typename: 'TextResponseBlock',
          journeyId: emailTextResponseBlock.journeyId,
          parentBlockId: emailTextResponseBlock.parentBlockId,
          parentOrder: emailTextResponseBlock.parentOrder,
          label: emailTextResponseBlock.label,
          minRows: emailTextResponseBlock.minRows,
          type: emailTextResponseBlock.type,
          required: emailTextResponseBlock.required,
          updatedAt: new Date()
        }
      })

      // Create button block with ID
      const originalIconBlock = block?.childBlocks.find(
        (child) => child.typename === 'IconBlock'
      )

      const buttonBlockId = uuidv4()
      const iconBlockId = uuidv4()
      const iconBlockId2 = uuidv4()
      await prisma.block.create({
        data: {
          id: buttonBlockId,
          typename: 'ButtonBlock',
          journeyId: block.journeyId,
          parentBlockId: block.parentBlockId,
          parentOrder: (block.parentOrder ?? 0) + 2,
          label: block.submitLabel ?? t('Submit'),
          variant: 'contained',
          color: 'primary',
          size: 'medium',
          submitEnabled: true,
          updatedAt: new Date(),
          startIconId: iconBlockId,
          endIconId: iconBlockId2,
          action: block.action
            ? {
                create: {
                  gtmEventName: block.action.gtmEventName,
                  blockId: block.action.blockId,
                  journeyId: block.action.journeyId,
                  url: block.action.url,
                  target: block.action.target,
                  email: block.action.email
                }
              }
            : undefined,
          childBlocks: {
            createMany: {
              data: [{
                id: iconBlockId,
                typename: 'IconBlock',
                journeyId: block.journeyId,
                color: originalIconBlock?.color ?? 'inherit',
                name: originalIconBlock?.name,
                updatedAt: new Date()
              },
              {
                id: iconBlockId2,
                typename: 'IconBlock',
                journeyId: block.journeyId,
                color: 'inherit',
                updatedAt: new Date()
              }
            ]}
          }
        }
      })

      // 4. Finally, remove the original SignUpBlock
      await prisma.block.delete({
        where: {
          id: block.id
        }
      })
    }
  } catch (error) {
    console.error('Error fetching SignUpBlocks:', error)
  } finally {
    // Disconnect from the Prisma client when done
    await prisma.$disconnect()
  }
}

// Execute the function
fetchSignUpBlocks()
  .then(() => console.log('Query completed successfully'))
  .catch((error) => console.error('Error running script:', error))

function t(arg0: string): string {
  return arg0 // Simple implementation that returns the input string
}
