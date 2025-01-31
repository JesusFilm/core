import findIndex from 'lodash/findIndex'
import reduce from 'lodash/reduce'
import { XYPosition } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  ACTION_BUTTON_HEIGHT,
  LINK_NODE_WIDTH_GAP_RIGHT,
  STEP_NODE_CARD_HEIGHT,
  STEP_NODE_CARD_WIDTH,
  STEP_NODE_HEIGHT_GAP,
  STEP_NODE_OFFSET,
  STEP_NODE_WIDTH_GAP
} from '../../nodes/StepBlockNode/libs/sizes'

export interface PositionMap {
  [id: string]: XYPosition
}

type TreeStepBlock = TreeBlock<StepBlock>

export function arrangeSteps(steps: TreeStepBlock[]): PositionMap {
  const positions: PositionMap = {}
  const blocks: TreeStepBlock[][] = []
  const unvisitedStepIds: string[] = steps.map((step) => step.id)

  function visitStepId(id?: string): TreeStepBlock | undefined {
    if (id == null) return
    const index = unvisitedStepIds.indexOf(id)
    if (index < 0) return
    unvisitedStepIds.splice(index, 1)
    return steps.find((step) => step.id === id)
  }

  function getNextStep(step: TreeStepBlock): TreeStepBlock | undefined {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null)
      return visitStepId(steps[index + 1].id)
    if (step.nextBlockId != null && step.nextBlockId !== step.id)
      return visitStepId(step.nextBlockId)
  }

  function getDescendantStepsOfStep(step: TreeStepBlock): TreeStepBlock[] {
    const descendants: TreeStepBlock[] = []
    const nextStep = getNextStep(step)
    if (nextStep != null) descendants.push(nextStep)

    const blocks = filterActionBlocks(step)

    blocks.forEach((child) => {
      if (child.action?.__typename === 'NavigateToBlockAction') {
        const nextStep = visitStepId(child.action?.blockId)
        if (nextStep != null) descendants.push(nextStep)
      }
    })
    return descendants
  }

  function processSteps(steps: TreeStepBlock[]): void {
    blocks.push(steps)
    const descendants = steps.flatMap((step) => {
      return getDescendantStepsOfStep(step)
    })
    if (descendants.length > 0) processSteps(descendants)
  }

  while (unvisitedStepIds.length > 0) {
    const step = visitStepId(unvisitedStepIds[0])
    if (step != null) processSteps([step])
  }

  const hasActionBlocks = blocks
    .flat()
    .some((step) => filterActionBlocks(step).length > 0)

  blocks.reduce((prevActionBlock, column, index) => {
    const gap = hasActionBlocks
      ? prevActionBlock
        ? LINK_NODE_WIDTH_GAP_RIGHT
        : LINK_NODE_WIDTH_GAP_RIGHT / 2
      : 0

    const stepX = index * (STEP_NODE_CARD_WIDTH + STEP_NODE_WIDTH_GAP + gap)

    reduce<TreeStepBlock, TreeStepBlock | null>(
      column,
      (result, step) => {
        let stepY = STEP_NODE_OFFSET
        if (result != null) {
          stepY =
            positions[result.id].y +
            (filterActionBlocks(result).length + 1) * ACTION_BUTTON_HEIGHT +
            STEP_NODE_CARD_HEIGHT +
            STEP_NODE_HEIGHT_GAP
        }
        positions[step.id] = {
          x: stepX,
          y: stepY
        }
        return step
      },
      null
    )

    return filterActionBlocks(column[column.length - 1]).length > 0
  }, false)

  return positions
}
