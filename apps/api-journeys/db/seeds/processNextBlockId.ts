import sortBy from 'lodash/sortBy'

import { PrismaClient } from '.prisma/api-journeys-client'

import { StepBlock } from '../../src/app/__generated__/graphql'

const prisma = new PrismaClient()

function getStepBlocks(blocks): StepBlock[] {
  return blocks.filter(
    (block): block is StepBlock => block.typename === 'StepBlock'
  )
}

function getNavigateActionBlocks(blocks) {
  return blocks.filter(
    (block): boolean =>
      block.action != null && block.action.gtmEventName === 'NavigateAction'
  )
}

function findParentStepBlock(blocks, actionBlock) {
  const block = blocks.find((block) => block.id === actionBlock.parentBlockId)

  if (block != null && block.typename === 'StepBlock') {
    return block.id
  } else {
    return findParentStepBlock(blocks, block)
  }
}

async function updateBlockAndActions(journey) {
  const blocks = journey.blocks
  const stepBlocks = sortBy(getStepBlocks(blocks), 'parentOrder')
  const navigateActionBlocks = getNavigateActionBlocks(blocks)

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

        await Promise.all(
          navigateActionBlocks
            .filter(
              (actionBlock) =>
                findParentStepBlock(blocks, actionBlock) === stepBlock.id
            )
            .map(async (actionBlock) => {
              await prisma.action.update({
                where: { parentBlockId: actionBlock.parentBlockId },
                data: { blockId: nextStepBlock.id }
              })
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

    await Promise.all(journeys.map(updateBlockAndActions))

    offset += 100
  }
}
