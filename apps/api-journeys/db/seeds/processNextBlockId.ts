import { PrismaClient } from '.prisma/api-journeys-client'

import { Block, Journey, StepBlock } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

// TODO:
// Step 1 - get all the journeys with blocks and actions
// Step 2 - flatten the blocks from journeys
// Step 3 - find all the StepBlock within a journey save into Steps variable
// Step 4 - check if current StepBlock is null and check steps if have a step after current block
// Step 5 - find all actions that are navigateAction
// Step 6 - copy the current nextBlockId of stepblock to all the navigate actions
// Step 7 - upsert or udpate the current journey that you're in with the updated information

function flatten(blocks, flattenedBlocks) {
  for (const block of blocks) {
    flattenedBlocks.push(block)
    if (block.children != null) {
      flatten(block.children, flattenedBlocks)
    }
  }
  return flattenedBlocks
}

async function getAllJourneys(offset: number) {
  return await prisma.journey.findMany({
    take: 100,
    skip: offset,
    include: { blocks: { include: { action: true } } }
  })
}

function getStepBlocks(blocks): StepBlock[] {
  return blocks.filter((block) => block.typename === 'StepBlock')
}

// action doesn't have a type
function getNavigateActions(blocks) {
  return blocks.map((block) => block.action)
}

function updateNavigateActions(stepBlock, navigateAction) {
  return console.log('stepblocks nextblockid')
}

async function updateJourneyBlocks(id, blocks): Promise<void> {}

export async function processNextBlockId(): Promise<void> {
  let offset = 0

  while (true) {
    const journeys = await getAllJourneys(offset)

    if (journeys.length === 0) break
    await Promise.all(
      journeys.map(async (journey) => {
        const blocks = flatten(journey.blocks, [])
        const stepBlocks = getStepBlocks(blocks)
        const navigateActionBlocks = getNavigateActions(blocks)

        await Promise.all(
          stepBlocks.map(async (stepBlock, index) => {
            const nextIndex = index + 1
            const hasNextStep = nextIndex < stepBlocks.length
            if (hasNextStep) {
              const nextStepBlock = stepBlocks[nextIndex]
              await prisma.block.update({
                where: { id: stepBlock.id },
                data: {
                  nextBlockId: nextStepBlock.id
                }
              })
            } else {
              stepBlock.nextBlockId = null
            }
          })
        )
        // await updateJourney(journey)
      })
    )
    offset += 100
  }
}
