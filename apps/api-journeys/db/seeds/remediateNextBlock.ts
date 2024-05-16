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
  if (get(obj, 'journeyId') != null) return 'NavigateToJourneyAction'
  if (get(obj, 'url') != null) return 'LinkAction'
  if (get(obj, 'email') != null) return 'EmailAction'
  return 'NavigateAction'
}

function getBlocksWithNavigateActions(blocks: Block[]): Block[] {
  return blocks.filter(
    (block) =>
      block.action != null && actionType(block.action) === 'NavigateAction'
  )
}

function getStepBlocks(blocks: Block[]): Block[] {
  return sortBy(
    blocks.filter((block) => block.typename === 'StepBlock'),
    'parentOrder'
  )
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

async function updateNextBlockId(
  id: string,
  nextBlockId: string
): Promise<void> {
  await prisma.block.update({
    where: { id },
    data: { nextBlockId }
  })
}

async function updateBlockAction(id: string, blockId: string): Promise<void> {
  await prisma.block.update({
    where: { id },
    data: {
      action: {
        update: {
          gtmEventName: 'NavigateToBlockAction',
          blockId
        }
      }
    }
  })
}

function getBlocksBelongingToCurrentStep(
  blocks: Block[],
  stepId: string
): Block[] {
  return blocks.filter(
    (block) =>
      block.parentBlockId != null &&
      findParentStepBlock(blocks, block.parentBlockId) === stepId
  )
}

async function processJourney(journey: Journey): Promise<void> {
  const steps = getStepBlocks(journey.blocks)
  const blocks = getBlocksWithNavigateActions(journey.blocks)

  await Promise.all(
    steps.map(async (step, index) => {
      let nextBlockId = step.nextBlockId
      if (nextBlockId == null) {
        const nextBlock = steps[index + 1]

        if (nextBlock != null) {
          await updateNextBlockId(step.id, nextBlock.id)
          nextBlockId = nextBlock.id
        }
      }

      const currentBlocks = getBlocksBelongingToCurrentStep(blocks, step.id)

      await Promise.all(
        currentBlocks.map(
          async (block) => await updateBlockAction(block.id, nextBlockId)
        )
      )
    })
  )
}

export async function remediateNextBlock(): Promise<void> {
  while (true) {
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
