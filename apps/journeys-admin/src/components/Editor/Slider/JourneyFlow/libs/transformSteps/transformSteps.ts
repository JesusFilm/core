import { darken } from '@mui/system/colorManipulator'
import findIndex from 'lodash/findIndex'
import { Edge, MarkerType, Node } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_StepBlock as StepBlock } from '../../../../../../../__generated__/BlockFields'
import { adminLight } from '../../../../../ThemeProvider/admin/theme'
import {
  ACTION_BUTTON_HEIGHT,
  STEP_NODE_CARD_HEIGHT
} from '../../nodes/StepBlockNode/libs/sizes'
import { PositionMap } from '../arrangeSteps'
import { filterActionBlocks } from '../filterActionBlocks'

export const MARKER_END_DEFAULT_COLOR = darken(adminLight.palette.divider, 0.5)
export const MARKER_END_SELECTED_COLOR = adminLight.palette.primary.main
export const defaultEdgeProps = {
  type: 'Custom',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    height: 10,
    width: 10,
    color: MARKER_END_DEFAULT_COLOR
  }
}

export const socialNode = {
  id: 'SocialPreview',
  type: 'SocialPreview',
  data: {},
  position: { x: -365, y: -46 },
  draggable: false
}

export const hiddenEdge = {
  id: 'SocialPreview->hidden',
  source: 'SocialPreview',
  target: 'hidden',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    height: 10,
    width: 10,
    color: MARKER_END_SELECTED_COLOR
  },
  style: {
    opacity: 0
  }
}
export const hiddenNode = {
  id: 'hidden',
  data: {},
  position: { x: -165, y: -46 },
  draggable: false,
  hidden: true
}

type TreeStepBlock = TreeBlock<StepBlock>

export function transformSteps(
  steps: TreeStepBlock[],
  positions: PositionMap
): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = [socialNode, hiddenNode]
  const edges: Edge[] = [hiddenEdge]

  function connectStepToNextBlock(
    step: TreeBlock<StepBlock>,
    steps: Array<TreeBlock<StepBlock>>
  ): void {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return

    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      edges.push({
        id: `${step.id}->${step.nextBlockId}`,
        source: step.id,
        sourceHandle: undefined,
        target: step.nextBlockId,
        ...defaultEdgeProps
      })
    }
  }

  function processActionBlock(
    block: TreeBlock,
    step: TreeBlock<StepBlock>,
    actionIndex: number
  ): void {
    if (!('action' in block) || block.action == null) return

    if (
      block.action.__typename === 'NavigateToBlockAction' &&
      block.action.blockId !== step.id
    ) {
      edges.push({
        id: `${block.id}->${block.action.blockId}`,
        source: step.id,
        sourceHandle: block.id,
        target: block.action.blockId,
        ...defaultEdgeProps
      })
    }

    if (
      block.action.__typename === 'LinkAction' ||
      block.action.__typename === 'EmailAction'
    ) {
      edges.push({
        id: `${block.id}->LinkNode-${block.id}`,
        source: step.id,
        sourceHandle: block.id,
        target: `LinkNode-${block.id}`,
        ...defaultEdgeProps
      })

      const position = {
        x: 300,
        y: STEP_NODE_CARD_HEIGHT + ACTION_BUTTON_HEIGHT * (actionIndex + 1)
      }

      nodes.push({
        id: `LinkNode-${block.id}`,
        type: 'Link',
        data: {},
        position,
        parentNode: step.id,
        draggable: false
      })
    }
  }

  steps.forEach((step) => {
    connectStepToNextBlock(step, steps)
    const actionBlocks = filterActionBlocks(step)
    actionBlocks.forEach((block, index) =>
      processActionBlock(block, step, index)
    )
    nodes.push({
      id: step.id,
      type: 'StepBlock',
      data: {},
      position: positions[step.id]
    })
  })

  if (steps[0] != null) {
    edges.push({
      id: `SocialPreview->${steps[0].id}`,
      source: 'SocialPreview',
      target: steps[0].id,
      ...defaultEdgeProps,
      type: 'Start'
    })
  }

  return { nodes, edges }
}
