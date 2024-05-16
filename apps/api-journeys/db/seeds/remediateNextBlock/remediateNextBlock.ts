import chunk from 'lodash/chunk'
import get from 'lodash/get'
import sortBy from 'lodash/sortBy'

import {
  Action,
  Block as PrismaBlock,
  Journey as PrismaJourney
} from '.prisma/api-journeys-client'

import prisma from './prisma'

type Block = PrismaBlock & { action?: Action | null }

type Journey = PrismaJourney & { blocks: Block[] }

function actionType(obj: Action): boolean {
  return (
    get(obj, 'blockId') == null &&
    get(obj, 'url') == null &&
    get(obj, 'email') == null
  )
}

function group<T>(array: T[], amount: number): T[][] {
  return chunk(array, Math.ceil(array.length / amount))
}

function findParentStepBlock(
  blocks: Block[],
  parentBlockId: string
): string | undefined {
  const block = blocks.find((block) => block.id === parentBlockId)
  if (block?.parentBlockId == null) {
    if (block?.typename === 'StepBlock') return block.id

    // following line should never run
    throw new Error("Parent block is not a step block or doesn't exist")
  }

  return findParentStepBlock(blocks, block.parentBlockId)
}

async function processJourney(journey: Journey): Promise<void> {
  console.log(journey.id, 'updating journey')
  // get step blocks belonging to journey
  const steps = sortBy(
    journey.blocks.filter((block) => block.typename === 'StepBlock'),
    'parentOrder'
  )

  // get blocks with navigate actions
  const actionBlocks = journey.blocks.filter(
    (block) => block.action != null && actionType(block.action)
  )

  const groupedSteps = group(steps, 5)
  for (let index = 0; index < groupedSteps.length; index++) {
    console.log(journey.id, index, 'processing step group')
    await Promise.all(
      groupedSteps[index].map(async (step, index) => {
        let nextBlockId = step.nextBlockId

        if (nextBlockId == null) {
          // implicit next block id on card
          const nextBlock = steps[index + 1]

          if (nextBlock != null) {
            // step is not last step in journey
            console.log(
              journey.id,
              index,
              step.id,
              nextBlock.id,
              'updating step with next block id'
            )
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
            findParentStepBlock(journey.blocks, block.parentBlockId) === step.id
        )

        // no blocks to update
        if (currentBlocks.length === 0) {
          console.log(journey.id, index, step.id, 'no blocks to update')
          return
        }

        if (nextBlockId != null) {
          // step is not last step, update all navigate actions in step
          await Promise.all(
            currentBlocks.map(async (block) => {
              console.log(
                journey.id,
                index,
                step.id,
                block.id,
                nextBlockId,
                'updating action with next block id'
              )
              await prisma.action.update({
                where: { parentBlockId: block.id },
                data: {
                  gtmEventName: 'NavigateToBlockAction',
                  blockId: nextBlockId
                }
              })
            })
          )
        } else {
          // step is last step, delete all navigate actions in step
          await Promise.all(
            currentBlocks.map(async (block) => {
              console.log(
                journey.id,
                index,
                step.id,
                block.id,
                'deleting action'
              )
              await prisma.action.delete({
                where: { parentBlockId: block.id }
              })
            })
          )
        }
      })
    )
  }
}

export async function remediateNextBlock(): Promise<void> {
  console.log('deleting all actions of step blocks')
  await prisma.action.deleteMany({
    where: {
      parentBlock: {
        typename: 'StepBlock'
      }
    }
  })

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

    for (let index = 0; index < journeys.length; index++) {
      await processJourney(journeys[index])
    }
  }
}

async function main(): Promise<void> {
  await remediateNextBlock()
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
