/**
 * NavigateToJourneyAction is being removed. This script is to convert all
 * usages of the property to the LinkAction instead.
 */
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
interface LinkActionUpdate {
  target: null
  gtmEventName: string
  url: string
}

function findParentStepBlock(blocks, parentBlockId): string {
  const block = blocks.find((block) => block.id === parentBlockId)
  if (block != null && block.typename === 'StepBlock') return block.id
  return findParentStepBlock(blocks, block.parentBlockId)
}

function urlFromJourneySlug(journey: Journey): string {
  if (journey.slug == null) {
    console.error('Journey slug is missing!')
    return ``
  } else {
    return `https://your.nextstep.is/${journey.slug}`
  }
}

function createLinkActionForJourney(journey: Journey): LinkActionUpdate {
  return {
    gtmEventName: 'LinkAction',
    url: urlFromJourneySlug(journey),
    target: null
  }
}

async function updateNextStepId(
  stepBlockId: string,
  nextStepBlockId: string
): Promise<void> {
  // many nextBlockIds are null - therefore update them
  await prisma.block.update({
    where: { id: stepBlockId },
    data: { nextBlockId: nextStepBlockId }
  })
}

function actionType(obj: Action): string {
  if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
  if (get(obj, 'journeyId') != null) return 'NavigateToJourneyAction'
  if (get(obj, 'url') != null) return 'LinkAction'
  if (get(obj, 'email') != null) return 'EmailAction'
  return 'NavigateAction'
}

function getNavigateToJourneyBlocks(blocks: BlockWithAction): Block[] {
  return blocks.filter(
    (block): boolean =>
      block.action != null &&
      actionType(block.action) === 'NavigateToJourneyAction'
  )
}

function getStepBlocks(blocks: Block[]): Block[] {
  return blocks.filter((block) => block.typename === 'StepBlock')
}

async function updateBlockAction(id: string, linkAction): Promise<void> {
  await prisma.block.update({
    where: { id: id },
    data: { action: { update: linkAction } }
  })
}

async function convertStepBlocksAndActions(
  journey: JourneyWithBlocks
): Promise<void> {
  const blocks = journey.blocks
  const stepBlocks = sortBy(getStepBlocks(blocks), 'parentOrder')
  const navigateToJourneyBlocks = getNavigateToJourneyBlocks(blocks)
  const linkAction = createLinkActionForJourney(journey)

  await Promise.all(
    stepBlocks.map(async (stepBlock, index) => {
      const nextIndex = index + 1
      const hasNextStep = nextIndex < stepBlocks.length
      const nextStepBlock = stepBlocks[nextIndex]

      if (hasNextStep) {
        await updateNextStepId(stepBlock.id, nextStepBlock.id)

        const childActionBlocks = navigateToJourneyBlocks.filter(
          (actionBlock) =>
            actionBlock.parentBlockId != null &&
            findParentStepBlock(blocks, actionBlock.parentBlockId) ===
              stepBlock.id
        )

        await Promise.all(
          childActionBlocks.map(
            async (block) => await updateBlockAction(block.id, linkAction)
          )
        )
      }
    })
  )
}

export async function remediateNavigateToJourney(): Promise<void> {
  let offset = 0
  while (true) {
    const journeys = await prisma.journey.findMany({
      take: 100,
      skip: offset,
      include: { blocks: { include: { action: true } } }
    })

    if (journeys.length === 0) break

    await Promise.all(journeys.map(convertStepBlocksAndActions))

    offset += 100
  }
}
