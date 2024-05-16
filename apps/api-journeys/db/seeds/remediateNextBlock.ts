import get from 'lodash/get'
import sortBy from 'lodash/sortBy'

import {
  Action,
  Block as PrismaBlock,
  PrismaClient,
  Journey as PrismaJourney
} from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

type Block = PrismaBlock & { action?: Action | null }

type Journey = PrismaJourney & { blocks: Block[] }

function actionType(obj: Action): string {
  if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
  if (get(obj, 'url') != null) return 'LinkAction'
  if (get(obj, 'email') != null) return 'EmailAction'
  return 'NavigateAction'
}

function findParentStepBlock(
  blocks: Block[],
  parentBlockId: string
): string | undefined {
  const block = blocks.find((block) => block.id === parentBlockId)
  if (block?.parentBlockId == null) return
  if (block != null && block.typename === 'StepBlock') return block.id
  return findParentStepBlock(blocks, block.parentBlockId)
}

async function processJourney(journey: Journey): Promise<void> {
  // get step blocks belonging to journey
  const steps = sortBy(
    journey.blocks.filter((block) => block.typename === 'StepBlock'),
    'parentOrder'
  )
  // get blocks with navigate actions
  const actionBlocks = journey.blocks.filter(
    (block) =>
      block.action != null && actionType(block.action) === 'NavigateAction'
  )
  await Promise.all(
    steps.map(async (step, index) => {
      let nextBlockId = step.nextBlockId

      if (nextBlockId == null) {
        // implicit next block id on card
        const nextBlock = steps[index + 1]

        if (nextBlock != null) {
          // step is not last step in journey
          await prisma.block.update({
            where: { id: step.id },
            data: { nextBlockId: nextBlock.id }
          })
          nextBlockId = nextBlock.id
        }
      }

      // get action blocks belonging to current step
      const currentBlocks = actionBlocks.filter(
        (block) =>
          block.parentBlockId != null &&
          findParentStepBlock(actionBlocks, block.parentBlockId) === step.id
      )

      // no blocks to update
      if (currentBlocks.length === 0) return

      if (nextBlockId != null) {
        // step is not last step, update all navigate actions in step
        await Promise.all(
          currentBlocks.map(
            async (block) =>
              await prisma.block.update({
                where: { id: block.id },
                data: {
                  action: {
                    update: {
                      gtmEventName: 'NavigateToBlockAction',
                      blockId: nextBlockId
                    }
                  }
                }
              })
          )
        )
      } else {
        // step is last step, delete all navigate actions in step
        await Promise.all(
          currentBlocks.map(
            async (block) =>
              await prisma.action.delete({
                where: { parentBlockId: block.id }
              })
          )
        )
      }
    })
  )
}

export async function remediateNextBlock(): Promise<void> {
  while (true) {
    // get journeys with blocks that have navigate actions
    const journeys = await prisma.journey.findMany({
      take: 100,
      include: { blocks: { include: { action: true } } },
      where: {
        blocks: {
          some: {
            action: { blockId: null, journeyId: null, url: null, email: null }
          }
        }
      }
    })
    if (journeys.length === 0) break

    await Promise.all(journeys.map(processJourney))
  }
}

async function main(): Promise<void> {
  await remediateNextBlock()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
