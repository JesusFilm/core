import Box from '@mui/material/Box'
import findIndex from 'lodash/findIndex'
import flatMapDeep from 'lodash/flatMapDeep'
import { ReactElement, useEffect } from 'react'
import ELK, { ElkNode } from 'elkjs/lib/elk.bundled.js'
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

const mrtreeLayout = {
  'elk.algorithm': 'mrtree',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '200',
  'elk.spacing.edgeNode': '50'
}

const bestLayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '250',
  'elk.spacing.edgeNode': '125',
  'elk.layered.spacing.nodeNodeBetweenLayers': '250',
  'elk.layered.layering.strategy': 'INTERACTIVE',
  'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',
  'elk.layered.crossingMinimization.strategy': 'NONE',
  'elk.layered.nodePlacement.strategy': 'INTERACTIVE'
}

type InternalNode =
  | Node<StepBlockNodeData, 'StepBlock'>
  | Node<RadioOptionBlockNodeData, 'RadioOptionBlock'>
  | Node<ButtonBlockNodeData, 'ButtonBlock'>
  | Node<TextResponseBlockNodeData, 'TextResponseBlock'>
  | Node<SignUpBlockNodeData, 'SignUpBlock'>
  | Node<FormBlockNodeData, 'FormBlock'>
  | Node<VideoBlockNodeData, 'VideoBlock'>

const getElkLayout = async (nodes: Node[], edges: Edge[]) => {
  const elk = new ELK()
  const graph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '250',
      'elk.spacing.edgeNode': '125',
      'elk.layered.spacing.nodeNodeBetweenLayers': '250',
      'elk.layered.layering.strategy': 'INTERACTIVE',
      'elk.layered.considerModelOrder.strategy': 'PREFER_EDGES',
      'elk.layered.crossingMinimization.strategy': 'NONE',
      'elk.layered.nodePlacement.strategy': 'INTERACTIVE'
    },
    children: nodes.map((node) => ({
      id: node.id,
      'elk.alignment': node.type === 'StepBlock' ? 'CENTER' : 'AUTOMATIC'
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  }

  const layout = await elk.layout(graph)
  if (!layout || !layout.children) {
    return {
      nodes: [],
      edges: []
    }
  }

  return {
    nodes: layout.children.map((node) => {
      const initialNode = nodes.find((n) => n.id === node.id)
      if (!initialNode) {
        throw new Error('Node not found')
      }
      return {
        ...initialNode,
        position: {
          x: node.x,
          y: node.y
        }
      } as Node
    }),
    edges: (layout.edges ?? []).map((edge) => {
      const initialEdge = edges.find((e) => e.id === edge.id)
      if (!initialEdge) {
        throw new Error('Edge not found')
      }
      return {
        ...initialEdge,
        source: edge.sources[0],
        target: edge.targets[0]
      } as Edge
    })
  }
}

function transformSteps(steps: Array<TreeBlock<StepBlock>>): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const nodes: InternalNode[] = []
  const edges: Edge[] = []

  const filterBlocks = [
    'RadioOptionBlock',
    'ButtonBlock',
    'TextResponseBlock',
    'SignUpBlock',
    'FormBlock',
    'VideoBlock'
  ]

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
    }).filter((block) => filterBlocks.includes(block.__typename)) as Array<
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
    const y = 0
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
    step.children[0].children.forEach((block) => {
      if (filterBlocks.includes(block.__typename)) {
        edges.push({
          id: `${step.id}->${block.id}`,
          source: step.id,
          target: block.id,
          markerEnd: {
            type: MarkerType.Arrow
          },
          style: {
            strokeWidth: 2
          }
        })
      }
    })

    const cardBlock = step?.children.find(
      (child) => child.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (cardBlock != null) processCard({ block: cardBlock, step, steps, x, y })
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
    const setLayout = async (nodes, edges) => {
      const { nodes: layoutNodes, edges: layoutEdges } = await getElkLayout(
        nodes,
        edges
      )
      setNodes(layoutNodes)
      setEdges(layoutEdges)
      console.log(layoutNodes)
    }

    const { nodes, edges } = transformSteps(steps ?? [])
    setLayout(nodes, edges)
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
