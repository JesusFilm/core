import Box from '@mui/material/Box'
import { ReactElement, useCallback, useEffect, useMemo, useRef } from 'react'
import ReactFlow, {
  Background,
  type Edge,
  MarkerType,
  type Node,
  type ReactFlowInstance,
  useEdgesState,
  useNodesState
} from 'reactflow'

import { type TreeBlock } from '@core/journeys/ui/block'
import { type BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'
import { transformer } from '@core/journeys/ui/transformer'

import { GetAdminJourney_journey as Journey } from '../../../../__generated__/GetAdminJourney'

import { AiViewEdge } from './edges/AiViewEdge'
import { layoutNodes } from './libs/layoutNodes'
import {
  AiCardPreviewNode,
  NODE_HEIGHT,
  NODE_WIDTH
} from './nodes/AiCardPreviewNode'

import 'reactflow/dist/style.css'

const nodeTypes = { StepBlock: AiCardPreviewNode }
const edgeTypes = { Custom: AiViewEdge }

interface AiJourneyFlowProps {
  journey?: Journey
  activeCardIds?: Set<string>
  selectedCardId: string | null
  onCardSelect: (cardId: string | null) => void
}

type TreeStepBlock = TreeBlock<StepBlock>

function getEdgeVariant(
  block: TreeBlock
): 'default' | 'button' | 'poll' {
  if (block.__typename === 'RadioOptionBlock') return 'poll'
  if (block.__typename === 'ButtonBlock') return 'button'
  return 'default'
}

function getEdgeLabel(block: TreeBlock): string | undefined {
  if ('label' in block && typeof block.label === 'string') return block.label
  return undefined
}

function buildNodesAndEdges(
  steps: TreeStepBlock[],
  activeCardIds: Set<string>,
  selectedCardId: string | null,
  onCardSelect: (cardId: string | null) => void,
  journey?: Journey
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  for (const step of steps) {
    const actionBlocks = filterActionBlocks(step)

    nodes.push({
      id: step.id,
      type: 'StepBlock',
      position: { x: 0, y: 0 },
      data: {
        step,
        isSelected: selectedCardId === step.id,
        isBeingEdited: activeCardIds.has(step.id),
        isCompleted: false,
        onCardSelect,
        journey
      }
    })

    if (step.nextBlockId != null && step.nextBlockId !== step.id) {
      const targetExists = steps.some((s) => s.id === step.nextBlockId)
      if (targetExists) {
        edges.push({
          id: `${step.id}->${step.nextBlockId}`,
          source: step.id,
          target: step.nextBlockId,
          type: 'Custom',
          data: { variant: 'default', label: 'Default' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            height: 8,
            width: 8,
            color: '#6D6D7D80'
          }
        })
      }
    }

    for (const block of actionBlocks) {
      if (block.action?.__typename !== 'NavigateToBlockAction') continue
      const targetId = block.action.blockId
      if (targetId === step.id) continue
      const targetExists = steps.some((s) => s.id === targetId)
      if (!targetExists) continue

      edges.push({
        id: `${block.id}->${targetId}`,
        source: step.id,
        target: targetId,
        type: 'Custom',
        data: {
          variant: getEdgeVariant(block),
          label: getEdgeLabel(block)
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          height: 8,
          width: 8,
          color: '#6D6D7D80'
        }
      })
    }
  }

  return { nodes, edges }
}

export function AiJourneyFlow({
  journey,
  activeCardIds = new Set(),
  selectedCardId,
  onCardSelect
}: AiJourneyFlowProps): ReactElement {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const reactFlowRef = useRef<ReactFlowInstance | null>(null)

  const steps = useMemo<TreeStepBlock[]>(() => {
    if (journey?.blocks == null) return []
    return transformer(journey.blocks) as TreeStepBlock[]
  }, [journey?.blocks])

  const handleInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowRef.current = instance
    setTimeout(() => instance.fitView({ padding: 0.2 }), 50)
  }, [])

  const handlePaneClick = useCallback(() => {
    onCardSelect(null)
  }, [onCardSelect])

  // Full layout rebuild when steps change
  useEffect(() => {
    if (steps.length === 0) {
      setNodes([])
      setEdges([])
      return
    }

    const { nodes: rawNodes, edges: newEdges } = buildNodesAndEdges(
      steps,
      activeCardIds,
      selectedCardId,
      onCardSelect,
      journey
    )

    const laidOutNodes = layoutNodes(rawNodes, newEdges, {
      nodeWidth: NODE_WIDTH,
      nodeHeight: NODE_HEIGHT
    })

    setNodes(laidOutNodes)
    setEdges(newEdges)

    if (reactFlowRef.current != null) {
      setTimeout(() => reactFlowRef.current?.fitView({ padding: 0.2 }), 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, setNodes, setEdges])

  // Update node data in-place when selection or active editing changes (no re-layout)
  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: selectedCardId === node.id,
          isBeingEdited: activeCardIds.has(node.id),
          onCardSelect,
          journey
        }
      }))
    )
  }, [selectedCardId, activeCardIds, onCardSelect, journey, setNodes])

  return (
    <Box
      data-testid="AiJourneyFlow"
      sx={{ width: '100%', height: '100%' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={handleInit}
        onPaneClick={handlePaneClick}
        onNodeClick={(_event, node) => onCardSelect(node.id)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        zoomOnScroll
        minZoom={0.2}
        maxZoom={4}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#E0E0E0" gap={20} size={1} />
      </ReactFlow>
    </Box>
  )
}
