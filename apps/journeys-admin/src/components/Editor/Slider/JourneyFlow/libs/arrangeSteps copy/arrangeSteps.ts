import findIndex from 'lodash/findIndex'
import { Edge, Node } from 'reactflow'

import {
  BlockFields,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { SocialPreviewNodeData } from '../../nodes/SocialPreviewNode'
import {
  STEP_NODE_HEIGHT,
  STEP_NODE_HEIGHT_GAP,
  STEP_NODE_WIDTH,
  STEP_NODE_WIDTH_GAP,
  StepBlockNodeData
} from '../../nodes/StepBlockNode'
import { ActionBlock, isActionBlock } from '../isActionBlock'
import { TreeBlock } from '@core/journeys/ui/block'

interface Connection<T = BlockFields> {
  block: TreeBlock<T>
  step: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

type InternalNode =
  | Node<StepBlockNodeData, 'StepBlock'>
  | Node<SocialPreviewNodeData, 'SocialPreview'>

function filterActionBlocks(step: TreeBlock<StepBlock>): ActionBlock[] {
  const card = step.children[0] as TreeBlock<CardBlock> | undefined
  if (card == null) return []

  return card.children
    .flatMap((block) =>
      block.__typename === 'RadioQuestionBlock' ? block.children : block
    )
    .filter(
      (child) => card.coverBlockId !== child.id && isActionBlock(child)
    ) as ActionBlock[]
}

export function arrangeSteps(steps: Array<TreeBlock<StepBlock>>): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const blocks: Array<Array<TreeBlock<StepBlock>>> = []
  const visitedStepIds: string[] = []

  function getStepFromId(id?: string): TreeBlock<StepBlock> | undefined {
    if (id == null) return
    if (visitedStepIds.includes(id)) return
    visitedStepIds.push(id)
    return steps.find((step) => step.id === id)
  }

  function getNextStep(
    step: TreeBlock<StepBlock>
  ): TreeBlock<StepBlock> | undefined {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null) {
      return getStepFromId(steps[index + 1].id)
    }
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      return getStepFromId(step.nextBlockId)
    }
  }

  function getDecendantStepsOfStep(
    step: TreeBlock<StepBlock>
  ): Array<TreeBlock<StepBlock>> {
    const descendants: Array<TreeBlock<StepBlock>> = []
    const nextStep = getNextStep(step)
    if (nextStep != null) descendants.push(nextStep)

    const blocks = filterActionBlocks(step)

    blocks.forEach((child) => {
      if (child.action?.__typename === 'NavigateToBlockAction') {
        const nextStep = getStepFromId(child.action?.blockId)
        if (nextStep != null) descendants.push(nextStep)
      }
    })
    return descendants
  }

  function processSteps(steps: Array<TreeBlock<StepBlock>>): void {
    blocks.push(steps)
    const descendants = steps.flatMap((step) => {
      return getDecendantStepsOfStep(step)
    })
    if (descendants.length > 0) processSteps(descendants)
  }

  const step = getStepFromId(steps[0]?.id)
  if (step != null) processSteps([step])

  blocks.forEach((row, index) => {
    const stepY = index * (STEP_NODE_HEIGHT + STEP_NODE_HEIGHT_GAP)
    row.forEach((step, index) => {
      const stepX =
        index * (STEP_NODE_WIDTH + STEP_NODE_WIDTH_GAP) -
        (row.length / 2) * (STEP_NODE_WIDTH + STEP_NODE_WIDTH_GAP)
    })
  })

  return { nodes, edges }
}
