import findIndex from 'lodash/findIndex'
import { Edge, MarkerType, Node } from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import { adminLight } from '../../../../../ThemeProvider/admin/theme'
import { PositionMap } from '../arrangeSteps'
import { filterActionBlocks } from '../filterActionBlocks'

export const MARKER_END_DEFAULT_COLOR = '#D3D3D3'
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

interface Connection<T = BlockFields> {
  block: TreeBlock<T>
  step: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

type TreeStepBlock = TreeBlock<StepBlock>

export function transformSteps(
  steps: TreeStepBlock[],
  positions: PositionMap
): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes: Node[] = []
  const edges: Edge[] = []

  function connectBlockToNextBlock({ block, step, steps }: Connection): void {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      edges.push({
        id: `${block.id}->${step.nextBlockId}`,
        source: step.id,
        sourceHandle: block.id !== step.id ? block.id : undefined,
        target: step.nextBlockId,
        ...defaultEdgeProps
      })
    }
  }

  function processActionBlock(block, step, steps): void {
    if (block.action == null) return

    if (block.action.__typename === 'NavigateToBlockAction') {
      edges.push({
        id: `${block.id}->${block.action.blockId}`,
        source: step.id,
        sourceHandle: block.id,
        target: block.action.blockId,
        ...defaultEdgeProps
      })
    }
  }

  steps.forEach((step) => {
    connectBlockToNextBlock({ block: step, step, steps })
    const actionBlocks = filterActionBlocks(step)
    actionBlocks.forEach((block) => processActionBlock(block, step, steps))
    nodes.push({
      id: step.id,
      type: 'StepBlock',
      data: {},
      position: positions[step.id]
    })
  })

  nodes.push({
    id: 'SocialPreview',
    type: 'SocialPreview',
    data: {},
    position: { x: -365, y: -46 },
    draggable: false
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

  // hidden edge so the markerEnd style can be used
  if (nodes.find((node) => node.id === 'hidden') == null) {
    nodes.push(hiddenNode)
    edges.push(hiddenEdge)
  }

  return { nodes, edges }
}
