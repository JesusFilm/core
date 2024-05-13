import findIndex from 'lodash/findIndex'
import { XYPosition } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import {
  STEP_NODE_CARD_HEIGHT,
  STEP_NODE_CARD_WIDTH,
  STEP_NODE_HEIGHT_GAP,
  STEP_NODE_WIDTH_GAP
} from '../../nodes/StepBlockNode/libs/sizes'
import { filterActionBlocks } from '../filterActionBlocks'

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

  blocks.forEach((column, index) => {
    const stepX = index * (STEP_NODE_CARD_WIDTH + STEP_NODE_WIDTH_GAP)
    column.forEach((step, index) => {
      const stepY =
        index * (STEP_NODE_CARD_HEIGHT + STEP_NODE_HEIGHT_GAP) -
        (column.length / 2) * (STEP_NODE_CARD_HEIGHT + STEP_NODE_HEIGHT_GAP)
      positions[step.id] = {
        x: stepX,
        y: stepY
      }
    })
  })

  return positions
}
