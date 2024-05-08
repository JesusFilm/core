import sortBy from 'lodash/sortBy'

import { PrismaClient } from '.prisma/api-journeys-client'

import { Block, StepBlock } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

function getStepBlocks(blocks): StepBlock[] {
  return blocks.filter(
    (block): block is StepBlock => block.typename === 'StepBlock'
  )
}

function getBlocksWithNavigateActions(blocks): Block[] {
  return blocks.filter(
    (block): boolean =>
      block.action != null && block.action.gtmEventName === 'NavigateAction'
  )
}

function findParentStepBlock(blocks, parentBlockId): string {
  const block = blocks.find((block) => block.id === parentBlockId)
  if (block != null && block.typename === 'StepBlock') return block.id
  return findParentStepBlock(blocks, block.parentBlockId)
}

async function updateStepBlocksAndActions(journey): Promise<void> {
  const blocks = journey.blocks
  const stepBlocks = sortBy(getStepBlocks(blocks), 'parentOrder')
  const blocksWithNavigateActions = getBlocksWithNavigateActions(blocks)

  await Promise.all(
    stepBlocks.map(async (stepBlock, index) => {
      const nextIndex = index + 1
      const hasNextStep = nextIndex < stepBlocks.length
      const nextStepBlock = stepBlocks[nextIndex]

      if (hasNextStep) {
        await prisma.block.update({
          where: { id: stepBlock.id },
          data: { nextBlockId: nextStepBlock.id }
        })

        const currentStepBlockActions = blocksWithNavigateActions.filter(
          (actionBlock) =>
            findParentStepBlock(blocks, actionBlock.parentBlockId) ===
            stepBlock.id
        )

        await Promise.all(
          currentStepBlockActions.map(async (block) => {
            if (block != null) {
              await prisma.block.update({
                where: { id: block.id },
                data: {
                  action: {
                    update: {
                      gtmEventName: 'NavigateToBlockAction',
                      blockId: nextStepBlock.id
                    }
                  }
                }
              })
            }
          })
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

    await Promise.all(journeys.map(updateStepBlocksAndActions))

    offset += 100
  }
}
