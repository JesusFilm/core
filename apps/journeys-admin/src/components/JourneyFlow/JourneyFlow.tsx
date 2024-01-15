import Box from '@mui/material/Box'
import findIndex from 'lodash/findIndex'
import flatMapDeep from 'lodash/flatMapDeep'
import { ReactElement, useEffect } from 'react'
import {
  Controls,
  Edge,
  MarkerType,
  Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields } from '../../../__generated__/BlockFields'
import {
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_FormBlock as FormBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_SignUpBlock as SignUpBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TextResponseBlock as TextResponseBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../__generated__/GetJourney'

import { NODE_HEIGHT, NODE_WIDTH } from './nodes/BaseNode'
import { ButtonBlockNode, ButtonBlockNodeData } from './nodes/ButtonBlockNode'
import { FormBlockNode, FormBlockNodeData } from './nodes/FormBlockNode'
import {
  RadioOptionBlockNode,
  RadioOptionBlockNodeData
} from './nodes/RadioOptionBlockNode'
import { SignUpBlockNode, SignUpBlockNodeData } from './nodes/SignUpBlockNode'
import { StepBlockNode, StepBlockNodeData } from './nodes/StepBlockNode'
import {
  TextResponseBlockNode,
  TextResponseBlockNodeData
} from './nodes/TextResponseBlockNode'
import { VideoBlockNode, VideoBlockNodeData } from './nodes/VideoBlockNode'

import 'reactflow/dist/style.css'

type InternalNode =
  | Node<StepBlockNodeData, 'StepBlock'>
  | Node<RadioOptionBlockNodeData, 'RadioOptionBlock'>
  | Node<ButtonBlockNodeData, 'ButtonBlock'>
  | Node<TextResponseBlockNodeData, 'TextResponseBlock'>
  | Node<SignUpBlockNodeData, 'SignUpBlock'>
  | Node<FormBlockNodeData, 'FormBlock'>
  | Node<VideoBlockNodeData, 'VideoBlock'>

function transformSteps(steps: Array<TreeBlock<StepBlock>>): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const nodes: InternalNode[] = []
  const edges: Edge[] = []

  interface Connection<T = BlockFields> {
    block: TreeBlock<T>
    step: TreeBlock<StepBlock>
    steps: Array<TreeBlock<StepBlock>>
  }

  function connectBlockToNextBlock({ block, step, steps }: Connection): void {
    const index = findIndex(steps, (child) => child.id === step.id)
    if (index < 0) return
    if (step.nextBlockId == null && steps[index + 1] != null) {
      edges.push({
        type: 'smoothstep',
        id: `${block.id}->${steps[index + 1].id}`,
        source: block.id,
        target: steps[index + 1].id,
        markerEnd: {
          type: MarkerType.Arrow
        },
        style: {
          strokeWidth: 2,
          strokeDasharray: 4
        }
      })
    }
    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      edges.push({
        type: 'smoothstep',
        id: `${block.id}->${step.nextBlockId}`,
        source: block.id,
        target: step.nextBlockId,
        markerEnd: {
          type: MarkerType.Arrow
        },
        style: {
          strokeWidth: 2,
          strokeDasharray: 4
        }
      })
    }
  }

  function processCard({
    block: card,
    step,
    steps,
    x,
    y
  }: Connection<CardBlock> & { x: number; y: number }): void {
    const blocks = flatMapDeep(card.children, (block) => {
      if (card.coverBlockId === block.id) return []
      return [block, block.children]
    }).filter(
      (block) =>
        block.__typename === 'RadioOptionBlock' ||
        block.__typename === 'ButtonBlock' ||
        block.__typename === 'TextResponseBlock' ||
        block.__typename === 'SignUpBlock' ||
        block.__typename === 'FormBlock' ||
        block.__typename === 'VideoBlock'
    ) as Array<
      TreeBlock<
        | RadioOptionBlock
        | ButtonBlock
        | TextResponseBlock
        | SignUpBlock
        | FormBlock
        | VideoBlock
      >
    >

    blocks.forEach((block, index) => {
      const node = {
        id: block.id,
        selectable: false,
        position: { x, y: y + (NODE_HEIGHT + 20) * (index + 1) }
      }
      switch (block.__typename) {
        case 'RadioOptionBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'ButtonBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'TextResponseBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'SignUpBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'FormBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
        case 'VideoBlock':
          nodes.push({
            ...node,
            type: block.__typename,
            data: block
          })
          break
      }
      if (block.action != null) {
        if (block.action.__typename === 'NavigateToBlockAction') {
          edges.push({
            type: 'smoothstep',
            id: `${block.id}->${block.action.blockId}`,
            source: block.id,
            target: block.action.blockId,
            markerEnd: {
              type: MarkerType.Arrow
            },
            style: {
              strokeWidth: 2
            }
          })
        }
        if (block.action.__typename === 'NavigateAction') {
          connectBlockToNextBlock({ block, step, steps })
        }
      }
    })
  }

  steps.forEach((step, index) => {
    const x = index * (NODE_WIDTH + 100)
    const y = index * 50
    nodes.push({
      id: step.id,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: step.__typename,
      data: {
        ...step,
        steps
      },
      position: { x, y }
    })

    const cardBlock = step?.children.find(
      (child) => child.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (cardBlock != null)
      processCard({ block: cardBlock, step, steps, x: x + 20, y })
    connectBlockToNextBlock({ block: step, step, steps })
  })

  return { nodes, edges }
}

export function JourneyFlow(): ReactElement {
  const {
    state: { steps }
  } = useEditor()

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])

  useEffect(() => {
    const { nodes, edges } = transformSteps(steps ?? [])
    setNodes(nodes)
    setEdges(edges)
  }, [steps, setNodes, setEdges])

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodeTypes={{
          RadioOptionBlock: RadioOptionBlockNode,
          StepBlock: StepBlockNode,
          ButtonBlock: ButtonBlockNode,
          TextResponseBlock: TextResponseBlockNode,
          SignUpBlock: SignUpBlockNode,
          FormBlock: FormBlockNode,
          VideoBlock: VideoBlockNode
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </Box>
  )
}
