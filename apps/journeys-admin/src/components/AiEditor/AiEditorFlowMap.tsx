import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { SxProps } from '@mui/material/styles'
import { ReactElement } from 'react'

import { JourneySimple, JourneySimpleCard } from '@core/shared/ai/journeySimpleTypes'

import { AiState } from './AiChat/AiChat'

interface AiEditorFlowMapProps {
  journey: JourneySimple
  selectedCardId: string | null
  aiState: AiState
  onCardSelect: (cardId: string) => void
  sx?: SxProps
}

interface CardNode {
  card: JourneySimpleCard
  index: number
}

function getCardConnections(
  cards: JourneySimpleCard[]
): Array<{ from: string; to: string }> {
  const connections: Array<{ from: string; to: string }> = []

  for (const card of cards) {
    if (card.defaultNextCard != null) {
      connections.push({ from: card.id, to: card.defaultNextCard })
    }
    if (card.button?.nextCard != null) {
      connections.push({ from: card.id, to: card.button.nextCard })
    }
    if (card.poll != null) {
      for (const option of card.poll) {
        if (option.nextCard != null) {
          connections.push({ from: card.id, to: option.nextCard })
        }
      }
    }
  }

  return connections
}

export function AiEditorFlowMap({
  journey,
  selectedCardId,
  aiState,
  onCardSelect,
  sx
}: AiEditorFlowMapProps): ReactElement {
  const CARD_WIDTH = 120
  const CARD_HEIGHT = 72
  const H_GAP = 48
  const V_GAP = 32
  const CARDS_PER_ROW = 3

  const nodes: CardNode[] = journey.cards.map((card, index) => ({
    card,
    index
  }))

  const useStoredCoords = journey.cards.every(
    (c) => typeof c.x === 'number' && typeof c.y === 'number'
  )

  function getPos(node: CardNode): { x: number; y: number } {
    if (useStoredCoords) {
      return {
        x: node.card.x * (CARD_WIDTH + H_GAP),
        y: node.card.y * (CARD_HEIGHT + V_GAP)
      }
    }
    const col = node.index % CARDS_PER_ROW
    const row = Math.floor(node.index / CARDS_PER_ROW)
    return {
      x: col * (CARD_WIDTH + H_GAP) + H_GAP,
      y: row * (CARD_HEIGHT + V_GAP) + V_GAP
    }
  }

  const positions = new Map(nodes.map((n) => [n.card.id, getPos(n)]))

  const maxX =
    Math.max(...Array.from(positions.values()).map((p) => p.x)) +
    CARD_WIDTH +
    H_GAP
  const maxY =
    Math.max(...Array.from(positions.values()).map((p) => p.y)) +
    CARD_HEIGHT +
    V_GAP

  const connections = getCardConnections(journey.cards)

  return (
    <Box
      sx={{
        overflow: 'auto',
        bgcolor: 'background.default',
        ...sx
      }}
    >
      <Box sx={{ position: 'relative', minWidth: maxX, minHeight: maxY }}>
        {/* SVG arrows */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: maxX,
            height: maxY,
            pointerEvents: 'none'
          }}
        >
          {connections.map(({ from, to }, i) => {
            const fromPos = positions.get(from)
            const toPos = positions.get(to)
            if (fromPos == null || toPos == null) return null

            const x1 = fromPos.x + CARD_WIDTH / 2
            const y1 = fromPos.y + CARD_HEIGHT
            const x2 = toPos.x + CARD_WIDTH / 2
            const y2 = toPos.y

            return (
              <g key={i}>
                <defs>
                  <marker
                    id={`arrow-${i}`}
                    markerWidth="6"
                    markerHeight="6"
                    refX="5"
                    refY="3"
                    orient="auto"
                  >
                    <path d="M0,0 L0,6 L6,3 z" fill="#9e9e9e" />
                  </marker>
                </defs>
                <path
                  d={`M ${x1} ${y1} C ${x1} ${(y1 + y2) / 2}, ${x2} ${(y1 + y2) / 2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#9e9e9e"
                  strokeWidth="1.5"
                  markerEnd={`url(#arrow-${i})`}
                />
              </g>
            )
          })}
        </svg>

        {/* Card nodes */}
        {nodes.map((node) => {
          const pos = getPos(node)
          const isSelected = selectedCardId === node.card.id
          const isAffected = aiState.affectedCardIds.includes(node.card.id)
          const isLoading = aiState.status === 'loading' && isAffected
          const isProposal = aiState.status === 'proposal' && isAffected

          return (
            <Paper
              key={node.card.id}
              elevation={isSelected ? 3 : 1}
              onClick={() => onCardSelect(node.card.id)}
              data-testid={`FlowMapCard-${node.card.id}`}
              sx={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                p: 1,
                cursor: 'pointer',
                overflow: 'hidden',
                border: 2,
                borderColor: isSelected
                  ? 'primary.main'
                  : isProposal
                    ? 'primary.light'
                    : isLoading
                      ? 'warning.light'
                      : 'transparent',
                animation: isLoading
                  ? 'pulse 1.5s ease-in-out infinite'
                  : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.6 }
                },
                '&:hover': { borderColor: 'primary.light', elevation: 2 }
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: '9px', display: 'block' }}
                >
                  {node.index + 1}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{
                    fontSize: '10px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                >
                  {node.card.heading ?? node.card.text ?? '(empty)'}
                </Typography>
                {isProposal && (
                  <AutoAwesomeIcon
                    sx={{
                      fontSize: 12,
                      color: 'primary.main',
                      position: 'absolute',
                      top: 0,
                      right: 0
                    }}
                  />
                )}
              </Box>
            </Paper>
          )
        })}
      </Box>
    </Box>
  )
}
