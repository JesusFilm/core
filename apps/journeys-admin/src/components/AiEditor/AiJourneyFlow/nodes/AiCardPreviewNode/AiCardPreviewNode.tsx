import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'
import { type ReactElement, useCallback } from 'react'
import { Handle, type NodeProps, Position } from 'reactflow'

import { type TreeBlock } from '@core/journeys/ui/block'
import { type BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

const CARD_PREVIEW_SCALE = 0.55
const CARD_FULL_WIDTH = 324
const CARD_FULL_HEIGHT = 500

export const NODE_WIDTH = Math.round(CARD_FULL_WIDTH * CARD_PREVIEW_SCALE)
export const NODE_HEIGHT = Math.round(CARD_FULL_HEIGHT * CARD_PREVIEW_SCALE)

const SELECTED_COLOR = '#4c9bf8'
const EDITING_COLOR = '#C52D3A'
const COMPLETED_COLOR = '#3AA74A'

interface AiCardPreviewNodeData {
  step: TreeBlock<StepBlock>
  isSelected: boolean
  isBeingEdited: boolean
  isCompleted: boolean
  onCardSelect: (cardId: string | null) => void
  sourceHandleCount: number
}

function getBorderColor(data: AiCardPreviewNodeData): string | undefined {
  if (data.isBeingEdited) return EDITING_COLOR
  if (data.isSelected) return SELECTED_COLOR
  if (data.isCompleted) return COMPLETED_COLOR
  return undefined
}

function getBoxShadow(data: AiCardPreviewNodeData): string | undefined {
  if (data.isBeingEdited)
    return `0 0 12px 2px ${EDITING_COLOR}40, 0 0 24px 4px ${EDITING_COLOR}20`
  if (data.isSelected)
    return `0 0 12px 2px ${SELECTED_COLOR}40, 0 0 24px 4px ${SELECTED_COLOR}20`
  return undefined
}

export function AiCardPreviewNode({
  id,
  data
}: NodeProps<AiCardPreviewNodeData>): ReactElement {
  const theme = useTheme()
  const borderColor = getBorderColor(data)
  const boxShadow = getBoxShadow(data)

  const handleClick = useCallback(() => {
    data.onCardSelect(id)
  }, [id, data])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        data.onCardSelect(id)
      }
    },
    [id, data]
  )

  const sourceHandleCount = data.sourceHandleCount ?? 1

  return (
    <Box
      data-testid={`AiCardPreviewNode-${id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`Card ${id}`}
      sx={{
        position: 'relative',
        width: NODE_WIDTH,
        cursor: 'pointer',
        borderRadius: 2,
        border: borderColor != null ? `2px solid ${borderColor}` : '2px solid',
        borderColor: borderColor ?? 'divider',
        bgcolor: 'background.paper',
        boxShadow,
        overflow: 'hidden',
        transition: theme.transitions.create([
          'border-color',
          'box-shadow'
        ]),
        '&:hover': {
          borderColor: borderColor ?? SELECTED_COLOR,
          boxShadow: boxShadow ?? `0 0 8px 1px ${SELECTED_COLOR}20`
        }
      }}
    >
      {data.isBeingEdited && <ShimmerOverlay />}

      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          background: theme.palette.grey[400],
          border: `2px solid ${theme.palette.background.paper}`,
          left: -5
        }}
      />

      <Box
        sx={{
          maxHeight: 400,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}
      >
        <Box
          sx={{
            width: CARD_FULL_WIDTH,
            transform: `scale(${CARD_PREVIEW_SCALE})`,
            transformOrigin: 'top left',
            pointerEvents: 'none'
          }}
        >
          <JourneyProvider value={{ variant: 'embed' }}>
            <BlockRenderer block={data.step} />
          </JourneyProvider>
        </Box>
      </Box>

      {Array.from({ length: sourceHandleCount }).map((_, index) => {
        const spacing = NODE_HEIGHT / (sourceHandleCount + 1)
        const topOffset = spacing * (index + 1)

        return (
          <Handle
            key={`source-${index}`}
            type="source"
            position={Position.Right}
            id={`source-${index}`}
            style={{
              width: 8,
              height: 8,
              background: theme.palette.grey[400],
              border: `2px solid ${theme.palette.background.paper}`,
              right: -5,
              top: topOffset
            }}
          />
        )
      })}
    </Box>
  )
}

function ShimmerOverlay(): ReactElement {
  return (
    <Box
      data-testid="ShimmerOverlay"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(197, 45, 58, 0.08)',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(197, 45, 58, 0.06) 50%, transparent 100%)',
          animation: 'shimmer 2s infinite linear',
          '@keyframes shimmer': {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' }
          }
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: EDITING_COLOR,
          color: 'common.white',
          borderRadius: 10,
          px: 1,
          py: 0.25,
          zIndex: 11
        }}
      >
        <CircularProgress size={10} sx={{ color: 'common.white' }} />
      </Box>
    </Box>
  )
}
