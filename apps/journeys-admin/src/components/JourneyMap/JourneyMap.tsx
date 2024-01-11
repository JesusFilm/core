import { useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import dagre from 'dagre'
import { ComponentProps, ReactElement, useMemo } from 'react'
import {
  Edge,
  MarkerType,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../__generated__/GetJourney'
import { StepBlockNextBlockUpdate } from '../../../__generated__/StepBlockNextBlockUpdate'
import { STEP_BLOCK_NEXT_BLOCK_UPDATE } from '../Editor/ControlPanel/Attributes/blocks/Step/NextCard/Cards'

import { ActionNode, ActionNodeType } from './ActionNode'
import { CustomNode, CustomNodeType } from './CustomNode'

import 'reactflow/dist/style.css'

const BoxStyled = styled(Box)`
  .react-flow .react-flow__node.selected {
    border-radius: 6px;
    box-shadow: 0px 0px 0px 6px #e4e4e4, 0px 0px 0px 8px #c52d3a;
  }

  .react-flow__handle.connectionindicator {
    background: #bbb;
    width: 8px;
    height: 8px;
    opacity: 0;
  }

  .react-flow__node.selected
    .react-flow__handle.connectionindicator.react-flow__handle-right {
    background: #fff;
    border-color: #c52d3a;
    border-width: 2px;
    width: 12px;
    height: 12px;
    opacity: 1;
  }

  .react-flow__node.selected .react-flow__handle-right,
  .react-flow__node:hover .react-flow__handle-right {
    right: -15px;
  }

  .react-flow__node .react-flow__handle-right {
    right: -6px;
  }

  .react-flow__node .react-flow__handle-left {
    left: -6px;
  }

  .react-flow__node.selected .react-flow__handle-left,
  .react-flow__node:hover .react-flow__handle-left {
    left: -15px;
  }
`

function findContent(
  block?: TreeBlock<CardBlock>
): [image?: string, title?: string] {
  if (block == null) return [undefined, undefined]

  let image: string | undefined
  let title: string | undefined
  for (let i = block.children.length - 1; i >= 0; i--) {
    const child = block.children[i]
    if (child.__typename === 'ImageBlock' && child?.src != null) {
      image = child?.src
    }

    if (child.__typename === 'TypographyBlock' && child?.content != null) {
      title = child.content
    }
  }

  return [image, title]
}

type InternalNode = Node<ActionNodeType | CustomNodeType>

function transformSteps(steps: Array<TreeBlock<StepBlock>>): {
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
            type: 'action',
            selectable: false,
            data: {
              type: 'custom',
              title: child.label,
              subline: 'MULTI CHOICE'
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
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    const [stepImage, stepTitle] = findContent(card)
    nodes.push({
      id: step.id,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      type: 'custom',
      data: {
        type: 'custom',
        title: stepTitle,
        subline: 'api.ts',
        bgColor: card?.backgroundColor,
        bgImage: stepImage
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
  steps?: Array<TreeBlock<StepBlock>>,
  direction = 'TB'
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

function FlowMap(props: ComponentProps<typeof ReactFlow>): ReactElement {
  return (
    <BoxStyled width="100%" height="100%">
      <ReactFlow
        {...props}
        fitView
        nodeTypes={{
          action: ActionNode,
          custom: CustomNode
        }}
        attributionPosition="bottom-left"
        style={{}}
        proOptions={{ hideAttribution: true }}
      />
    </BoxStyled>
  )
}

export function JourneyMap(): ReactElement {
  const {
    state: { steps }
  } = useEditor()

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(steps, 'LR'),
    [steps]
  )

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges)

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
    <Box sx={{ height: '800px' }}>
      <ReactFlowProvider>
        <FlowMap
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </ReactFlowProvider>
    </Box>
  )
}
