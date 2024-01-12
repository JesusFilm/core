import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import dagre from 'dagre'
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
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { StepBlockNextBlockUpdate } from '../../../__generated__/StepBlockNextBlockUpdate'
import { STEP_BLOCK_NEXT_BLOCK_UPDATE } from '../Editor/ControlPanel/Attributes/blocks/Step/NextCard/Cards'

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

  function processBlock(block: TreeBlock, step: TreeBlock<StepBlock>): void {
    if (
      block.__typename === 'RadioOptionBlock' ||
      block.__typename === 'ButtonBlock' ||
      block.__typename === 'TextResponseBlock' ||
      block.__typename === 'SignUpBlock' ||
      block.__typename === 'FormBlock' ||
      block.__typename === 'VideoBlock'
    ) {
      nodes.push({
        id: block.id,
        type: block.__typename,
        selectable: false,
        data: block,
        position: { x: 0, y: 0 }
      })

      if (
        block.action != null &&
        block.action.__typename === 'NavigateToBlockAction'
      ) {
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

      edges.push({
        id: `${step.id}->${block.id}`,
        source: step.id,
        target: block.id,
        style: {
          strokeWidth: 2
        }
      })
    }

    block.children.forEach((child) => {
      if (block.__typename === 'CardBlock' && block.coverBlockId === child.id) {
        return
      }
      processBlock(child, step)
    })
  }

  steps.forEach((step, index) => {
    nodes.push({
      id: step.id,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: step.__typename,
      data: {
        ...step,
        steps
      },
      position: { x: 0, y: 0 }
    })
    processBlock(step, step)

    if (step.nextBlockId == null && steps[index + 1] != null) {
      edges.push({
        id: `${step.id}->${steps[index + 1].id}`,
        source: step.id,
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
        id: `${step.id}->${step.nextBlockId}`,
        source: step.id,
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
  })

  return { nodes, edges }
}

const nodeWidth = 130
const nodeHeight = 60

function getLayoutedElements(
  steps: Array<TreeBlock<StepBlock>>,
  direction: string
): { nodes: InternalNode[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  if (steps == null) return { nodes: [], edges: [] }

  const { nodes, edges } = transformSteps(steps)
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 30, // vertical
    ranksep: 80, // horizontal
    ranker: 'tight-tree'
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = isHorizontal ? Position.Left : Position.Top
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2
    }
    return node
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
    const { nodes, edges } = getLayoutedElements(steps ?? [], 'LR')
    setNodes(nodes)
    setEdges(edges)
  }, [steps, setNodes, setEdges])

  const [stepBlockNextBlockUpdate] = useMutation<StepBlockNextBlockUpdate>(
    STEP_BLOCK_NEXT_BLOCK_UPDATE
  )

  const { journey } = useJourney()

  async function onConnect(params): Promise<void> {
    if (journey == null) return

    await stepBlockNextBlockUpdate({
      variables: {
        id: params.source,
        journeyId: journey.id,
        input: {
          nextBlockId: params.target
        }
      }
    })
  }

  return (
    <Box sx={{ height: 800, flexShrink: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
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
