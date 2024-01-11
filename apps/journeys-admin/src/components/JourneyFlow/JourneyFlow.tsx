import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import dagre from 'dagre'
import { TFunction } from 'i18next'
import { ReactElement, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { getStepHeading } from '@core/journeys/ui/getStepHeading'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../__generated__/globalTypes'
import { StepBlockNextBlockUpdate } from '../../../__generated__/StepBlockNextBlockUpdate'
import { STEP_BLOCK_NEXT_BLOCK_UPDATE } from '../Editor/ControlPanel/Attributes/blocks/Step/NextCard/Cards'

import {
  RadioOptionBlockNode,
  RadioOptionBlockNodeData
} from './nodes/RadioOptionBlockNode'
import { StepBlockNode, StepBlockNodeData } from './nodes/StepBlockNode'

import 'reactflow/dist/style.css'

function getStepBlockNodeData(card?: TreeBlock<CardBlock>): StepBlockNodeData {
  if (card == null) return {}

  let bgImage: string | undefined

  const coverBlock = card.children.find(
    (block) =>
      block.id === card.coverBlockId &&
      (block.__typename === 'ImageBlock' || block.__typename === 'VideoBlock')
  ) as TreeBlock | undefined

  if (coverBlock?.__typename === 'VideoBlock') {
    bgImage =
      (coverBlock.source !== VideoBlockSource.youTube &&
      coverBlock.source !== VideoBlockSource.cloudflare
        ? // Use posterBlockId image or default poster image on video
          coverBlock?.posterBlockId != null
          ? (
              coverBlock.children.find(
                (block) =>
                  block.id === coverBlock.posterBlockId &&
                  block.__typename === 'ImageBlock'
              ) as TreeBlock<ImageBlock>
            ).src
          : coverBlock?.video?.image
        : // Use Youtube or Cloudflare set poster image
          coverBlock?.image) ?? undefined
  } else if (coverBlock?.__typename === 'ImageBlock') {
    bgImage = coverBlock?.src ?? undefined
  }

  return {
    bgColor: card.backgroundColor,
    bgImage
  }
}

type InternalNode =
  | Node<StepBlockNodeData, 'StepBlock'>
  | Node<RadioOptionBlockNodeData, 'RadioOptionBlock'>

function transformSteps(
  steps: Array<TreeBlock<StepBlock>>,
  t: TFunction
): {
  nodes: InternalNode[]
  edges: Edge[]
} {
  const nodes: InternalNode[] = []
  const edges: Edge[] = []

  function findRadioQuestions(block: TreeBlock, stepBlockId: string): void {
    if (block.__typename === 'RadioQuestionBlock') {
      block.children.forEach((child) => {
        if (child.__typename === 'RadioOptionBlock') {
          nodes.push({
            id: child.id,
            type: child.__typename,
            selectable: false,
            data: {
              title: child.label
            },
            position: { x: 0, y: 0 }
          })

          if (
            child.action != null &&
            child.action.__typename === 'NavigateToBlockAction'
          ) {
            edges.push({
              id: `${child.id}->${child.action.blockId}`,
              source: child.id,
              target: child.action.blockId,
              markerEnd: {
                type: MarkerType.Arrow
              },
              style: {
                strokeWidth: 2
              }
            })
          }

          if (child.id != null) {
            edges.push({
              id: `${stepBlockId}->${child.id}`,
              source: stepBlockId,
              target: child.id,
              style: {
                strokeWidth: 2
              }
            })
          }
        }
      })
    }

    if (block.children != null) {
      block.children.forEach((child) => findRadioQuestions(child, stepBlockId))
    }
  }

  steps.forEach((step, index) => {
    findRadioQuestions(step, step.id)
    const card = step.children.find(
      (card) => card.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    const data = getStepBlockNodeData(card)
    nodes.push({
      id: step.id,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: step.__typename,
      data: {
        ...data,
        title: getStepHeading(step.id, step.children, steps, t)
      },
      position: { x: 0, y: 0 }
    })
    let buttonBlockFound = false
    card?.children.forEach((child) => {
      if (child.__typename === 'ButtonBlock') {
        if (
          child.action != null &&
          child.action.__typename === 'NavigateToBlockAction'
        ) {
          buttonBlockFound = true
          edges.push({
            id: `${step.id}->${child.action.blockId}`,
            source: step.id,
            target: child.action.blockId,
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
    })

    if (!buttonBlockFound) {
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
    }
  })

  return { nodes, edges }
}

const nodeWidth = 130
const nodeHeight = 60

function getLayoutedElements(
  steps: Array<TreeBlock<StepBlock>>,
  direction: string,
  t: TFunction
): { nodes: InternalNode[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  if (steps == null) return { nodes: [], edges: [] }

  const { nodes, edges } = transformSteps(steps, t)
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
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { steps }
  } = useEditor()

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    const { nodes, edges } = getLayoutedElements(steps ?? [], 'LR', t)
    setNodes(nodes)
    setEdges(edges)
  }, [steps, t, setNodes, setEdges])

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
    <Box sx={{ height: 400, flexShrink: 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        // onNodesChange={onNodesChange}
        // onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={{
          RadioOptionBlock: RadioOptionBlockNode,
          StepBlock: StepBlockNode
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} />
      </ReactFlow>
    </Box>
  )
}
