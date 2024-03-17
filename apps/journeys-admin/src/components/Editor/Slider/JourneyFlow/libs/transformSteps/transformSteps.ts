import findIndex from 'lodash/findIndex'
import { Edge, Node } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields,
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ACTION_NODE_HEIGHT_GAP,
  ACTION_NODE_WIDTH,
  ACTION_NODE_WIDTH_GAP
} from '../../nodes/ActionNode'
import { ButtonBlockNodeData } from '../../nodes/ButtonBlockNode'
import { FormBlockNodeData } from '../../nodes/FormBlockNode'
import { RadioOptionBlockNodeData } from '../../nodes/RadioOptionBlockNode'
import { SignUpBlockNodeData } from '../../nodes/SignUpBlockNode'
import { SocialPreviewNodeData } from '../../nodes/SocialPreviewNode'
import {
  STEP_NODE_HEIGHT,
  STEP_NODE_HEIGHT_GAP,
  STEP_NODE_WIDTH,
  STEP_NODE_WIDTH_GAP,
  StepBlockNodeData
} from '../../nodes/StepBlockNode'
import { TextResponseBlockNodeData } from '../../nodes/TextResponseBlockNode'
import { VideoBlockNodeData } from '../../nodes/VideoBlockNode'
import { ActionBlock, isActionBlock } from '../isActionBlock'

interface Connection<T = BlockFields> {
  block: TreeBlock<T>
  step: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

type InternalNode =
  | Node<StepBlockNodeData, 'StepBlock'>
  | Node<RadioOptionBlockNodeData, 'RadioOptionBlock'>
  | Node<ButtonBlockNodeData, 'ButtonBlock'>
  | Node<TextResponseBlockNodeData, 'TextResponseBlock'>
  | Node<SignUpBlockNodeData, 'SignUpBlock'>
  | Node<FormBlockNodeData, 'FormBlock'>
  | Node<VideoBlockNodeData, 'VideoBlock'>
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

export function transformSteps(steps: Array<TreeBlock<StepBlock>>): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const nodes: InternalNode[] = []
  const edges: Edge[] = []

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

  function connectBlockToNextBlock({ block, step, steps }: Connection): void {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null) {
      edges.push({
        id: `${block.id}->${steps[index + 1].id}`,
        source: block.id,
        target: steps[index + 1].id,
        // markerEnd: {
        //   type: MarkerType.Arrow
        // },
        style: {
          // strokeWidth: 2,
          strokeDasharray: 4
        },
        type: 'smart'
      })
    }
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      edges.push({
        id: `${block.id}->${step.nextBlockId}`,
        source: block.id,
        target: step.nextBlockId,
        // markerEnd: {
        //   type: MarkerType.Arrow
        // },
        style: {
          // strokeWidth: 2,
          strokeDasharray: 4
        },
        type: 'smart'
      })
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

  function processBlock(block, step, steps, position): void {
    const node = {
      id: block.id,
      selectable: false,
      position
    }
    switch (block.__typename) {
      case 'RadioOptionBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'ButtonBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'TextResponseBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'SignUpBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'FormBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
      case 'VideoBlock':
        nodes.push({
          ...node,
          type: block.__typename,
          data: { ...block, step }
        })
        break
    }
    if (block.action != null) {
      if (block.action.__typename === 'NavigateToBlockAction') {
        edges.push({
          id: `${block.id}->${block.action.blockId}`,
          source: block.id,
          target: block.action.blockId,
          type: 'smart',
          // markerEnd: {
          //   type: MarkerType.Arrow
          // },
          style: {
            // strokeWidth: 2
          }
        })
      }
      if (block.action.__typename === 'NavigateAction') {
        connectBlockToNextBlock({ block, step, steps })
      }
    }
  }

  const step = getStepFromId(steps[0]?.id)
  if (step != null) processSteps([step])

  blocks.forEach((row, index) => {
    const stepY = index * (STEP_NODE_HEIGHT + STEP_NODE_HEIGHT_GAP)
    row.forEach((step, index) => {
      connectBlockToNextBlock({ block: step, step, steps })
      const stepX =
        index * (STEP_NODE_WIDTH + STEP_NODE_WIDTH_GAP) -
        (row.length / 2) * (STEP_NODE_WIDTH + STEP_NODE_WIDTH_GAP)
      nodes.push({
        id: step.id,
        type: 'StepBlock',
        data: { ...step, steps },
        position: { x: stepX, y: stepY }
      })
      const blockY = stepY + STEP_NODE_HEIGHT + ACTION_NODE_HEIGHT_GAP
      const blocks = filterActionBlocks(step)
      blocks.forEach((block, index) => {
        const blockX =
          stepX +
          index * (ACTION_NODE_WIDTH + ACTION_NODE_WIDTH_GAP) -
          (blocks.length / 2) * (ACTION_NODE_WIDTH + ACTION_NODE_WIDTH_GAP) +
          STEP_NODE_WIDTH / 2 +
          ACTION_NODE_WIDTH_GAP / 2
        processBlock(block, step, steps, { x: blockX, y: blockY })
      })
    })
  })

  nodes.push({
    type: 'SocialPreview',
    id: 'SocialPreview',
    position: { x: -165, y: -195 },
    data: { __typename: 'SocialPreview' }
  })

  return { nodes, edges }
}
