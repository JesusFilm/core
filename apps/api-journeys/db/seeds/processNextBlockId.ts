import get from 'lodash/get'
import sortBy from 'lodash/sortBy'

import {
  Action,
  Block,
  Journey,
  PrismaClient
} from '.prisma/api-journeys-client'

const prisma = new PrismaClient()

type BlockWithAction = Array<Block & { action: Action }>

type JourneyWithBlocks = Journey & { blocks: BlockWithAction }

function actionType(obj: Action): string {
  if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
  if (get(obj, 'journeyId') != null) return 'NavigateToJourneyAction'
  if (get(obj, 'url') != null) return 'LinkAction'
  if (get(obj, 'email') != null) return 'EmailAction'
  return 'NavigateAction'
}

function getBlocksWithNavigateActions(blocks: BlockWithAction): Block[] {
  return blocks.filter(
    (block): boolean =>
      block.action != null && actionType(block.action) === 'NavigateAction'
  )
}

function getStepBlocks(blocks: Block[]): Block[] {
  return blocks.filter((block) => block.typename === 'StepBlock')
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

async function processStepBlockAndActions(
  journey: JourneyWithBlocks
): Promise<void> {
  const blocks = journey.blocks
  const stepBlocks = sortBy(getStepBlocks(blocks), 'parentOrder')
  const blocksWithNavigateActions = getBlocksWithNavigateActions(blocks)

  await Promise.all(
    stepBlocks.map(async (stepBlock, index) => {
      const nextIndex = index + 1
      const nextStepBlock = stepBlocks[nextIndex]

      if (nextStepBlock != null) {
        await updateNextBlockId(stepBlock.id, nextStepBlock.id)

        const currentStepBlockActions = blocksWithNavigateActions.filter(
          (actionBlock) =>
            actionBlock.parentBlockId != null &&
            findParentStepBlock(blocks, actionBlock.parentBlockId) ===
              stepBlock.id
        )

        await Promise.all(
          currentStepBlockActions.map(
            async (block) => await updateBlockAction(block.id, nextStepBlock.id)
          )
        )
      }
    })
  )
}

export async function processNextBlockId(): Promise<void> {
  let offset = 0
  while (true) {
    const journeys = await prisma.journey.findMany({
      take: 100,
      skip: offset,
      include: { blocks: { include: { action: true } } }
    })

    if (journeys.length === 0) break

    await Promise.all(journeys.map(processStepBlockAndActions))

    offset += 100
  }
}
