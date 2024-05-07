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

async function getAllJourneys() {
  return await prisma.journey.findMany({
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

async function updateJourney(journey: Journey): Promise<void> {
  console.log('journey', journey)
  // await prisma.journey.upsert({
  //   where: { id },
  //   update: data,
  //   create: data
  // })
}

export async function processNextBlockId(): Promise<void> {
  const journeys = await getAllJourneys()

  journeys.forEach((journey) => {
    const blocks = flatten(journey.blocks, [])
    const stepBlocks = getStepBlocks(blocks)
    const navigateActionBlocks = getNavigateActions(blocks)

    // console.log('stepBlocks', stepBlocks)
    console.log('navigateActionBlocks', navigateActionBlocks)

    stepBlocks.forEach((stepBlock, index, blocks) => {
      const nextIndex = index + 1
      const hasNextStep = nextIndex < blocks.length

      if (hasNextStep) {
        const nextStepBlock = blocks[nextIndex]
        // stepBlock.nextBlockId = nextStepBlock.id
        console.log('nextBlockId', stepBlock.nextBlockId)

        // fix up logic for getting all the navigate actions
        // return data doesn't have typename
        const navigateActions = getNavigateActions(blocks)
        updateNavigateActions(stepBlock, navigateActions)
      } else {
        stepBlock.nextBlockId = null
      }

      // await updateJourney(journey)
    })
  })
}
