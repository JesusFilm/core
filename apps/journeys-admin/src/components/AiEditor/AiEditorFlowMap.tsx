import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { SxProps, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { MouseEvent, ReactElement, memo, useMemo } from 'react'
import {
  Background,
  Edge,
  Handle,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'

import { JourneySimple } from '@core/shared/ai/journeySimpleTypes'

import { AiState } from './AiChat/AiChat'

const NODE_WIDTH = 160
const NODE_HEIGHT = 60

interface AiCardNodeData {
  cardIndex: number
  label: string
  isAffected: boolean
  isLoading: boolean
  isSelected: boolean
}

const AiCardNode = memo(
  ({ data, id }: NodeProps<AiCardNodeData>): ReactElement => {
    const { label, cardIndex, isAffected, isLoading, isSelected } = data
    const theme = useTheme()

    const borderColor = isSelected
      ? theme.palette.primary.main
      : isAffected
        ? theme.palette.primary.main
        : theme.palette.divider

    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
        <Paper
          elevation={isSelected ? 4 : 1}
          data-testid={`AiCardNode-${id}`}
          sx={{
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            border: `2px solid ${borderColor}`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            px: 1.5,
            gap: 1,
            bgcolor: isAffected ? 'primary.50' : 'background.paper',
            cursor: 'pointer',
            userSelect: 'none',
            animation: isLoading ? 'aiPulse 1.5s infinite' : 'none',
            '@keyframes aiPulse': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.55 },
              '100%': { opacity: 1 }
            }
          }}
        >
          <Box
            sx={{
              minWidth: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor: isAffected ? 'primary.main' : 'action.selected',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{
                fontSize: '9px',
                color: isAffected ? 'primary.contrastText' : 'text.secondary'
              }}
            >
              {cardIndex}
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontWeight: isSelected ? 600 : 400
            }}
          >
            {label !== '' ? label : '…'}
          </Typography>
        </Paper>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
      </>
    )
  }
)
AiCardNode.displayName = 'AiCardNode'

interface AiEditorFlowMapProps {
  journey: JourneySimple
  selectedCardId: string | null
  aiState: AiState
  onCardSelect: (cardId: string) => void
  sx?: SxProps
}

function AiEditorFlowMapInner({
  journey,
  selectedCardId,
  aiState,
  onCardSelect,
  sx
}: AiEditorFlowMapProps): ReactElement {
  const nodeTypes = useMemo(() => ({ aiCard: AiCardNode }), [])

  const { nodes, edges } = useMemo(() => {
    const nodes: Node<AiCardNodeData>[] = journey.cards.map((card, index) => ({
      id: card.id,
      position: { x: card.x, y: card.y },
      type: 'aiCard',
      data: {
        cardIndex: index + 1,
        label: card.heading ?? card.text ?? '',
        isAffected: aiState.affectedCardIds.includes(card.id),
        isLoading: aiState.status === 'loading',
        isSelected: card.id === selectedCardId
      }
    }))

    const edges: Edge[] = []
    for (const card of journey.cards) {
      if (card.defaultNextCard != null) {
        edges.push({
          id: `${card.id}->default->${card.defaultNextCard}`,
          source: card.id,
          target: card.defaultNextCard,
          style: { strokeWidth: 1.5 }
        })
      }
      if (card.button?.nextCard != null) {
        edges.push({
          id: `${card.id}->btn->${card.button.nextCard}`,
          source: card.id,
          target: card.button.nextCard,
          label: card.button.text,
          style: { strokeWidth: 1.5 }
        })
      }
      if (card.poll != null) {
        card.poll.forEach((opt, i) => {
          if (opt.nextCard != null) {
            edges.push({
              id: `${card.id}->poll${i}->${opt.nextCard}`,
              source: card.id,
              target: opt.nextCard,
              label: opt.text,
              style: { strokeWidth: 1.5 }
            })
          }
        })
      }
    }

    return { nodes, edges }
  }, [journey, selectedCardId, aiState])

  function handleNodeClick(_: MouseEvent, node: Node): void {
    onCardSelect(node.id)
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        borderTop: 1,
        borderColor: 'divider',
        ...sx
      }}
      data-testid="AiEditorFlowMap"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode={[]}
      >
        <Background color="#ccc" gap={16} />
      </ReactFlow>
    </Box>
  )
}

export function AiEditorFlowMap(props: AiEditorFlowMapProps): ReactElement {
  return (
    <ReactFlowProvider>
      <AiEditorFlowMapInner {...props} />
    </ReactFlowProvider>
  )
}
