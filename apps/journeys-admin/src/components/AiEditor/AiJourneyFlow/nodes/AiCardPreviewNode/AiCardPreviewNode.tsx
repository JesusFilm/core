import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { type ReactElement, useCallback, useMemo } from 'react'
import { Handle, type NodeProps, Position } from 'reactflow'

import { type TreeBlock } from '@core/journeys/ui/block'
import { type BlockFields_StepBlock as StepBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import { GetAdminJourney_journey as Journey } from '../../../../../../__generated__/GetAdminJourney'

const CARD_FULL_WIDTH = 380
const CARD_FULL_HEIGHT = 674
const SCALE = 0.35

const SCALED_WIDTH = Math.round(CARD_FULL_WIDTH * SCALE)
const SCALED_HEIGHT = Math.round(CARD_FULL_HEIGHT * SCALE)

export const NODE_WIDTH = SCALED_WIDTH + 8
export const NODE_HEIGHT = SCALED_HEIGHT + 8

const SELECTED_COLOR = '#4c9bf8'
const EDITING_COLOR = '#C52D3A'

interface AiCardPreviewNodeData {
  step: TreeBlock<StepBlock>
  isSelected: boolean
  isBeingEdited: boolean
  isCompleted: boolean
  onCardSelect: (cardId: string | null) => void
  journey?: Journey
}

function getBorderColor(data: AiCardPreviewNodeData): string | undefined {
  if (data.isBeingEdited) return EDITING_COLOR
  if (data.isSelected) return SELECTED_COLOR
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

  const stepTheme = useMemo(
    () => getStepTheme(data.step, data.journey ?? undefined),
    [data.step, data.journey]
  )

  return (
    <Box
      data-testid={`AiCardPreviewNode-${id}`}
      onClick={handleClick}
      tabIndex={0}
      sx={{
        position: 'relative',
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        cursor: 'pointer'
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
          width: SCALED_WIDTH,
          height: SCALED_HEIGHT,
          m: 0.5,
          borderRadius: 2,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: borderColor ?? 'divider',
          boxShadow: boxShadow ?? 1,
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
        <Box
          sx={{
            width: CARD_FULL_WIDTH,
            height: CARD_FULL_HEIGHT,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left'
          }}
        >
          <FramePortal
            width={CARD_FULL_WIDTH}
            height={CARD_FULL_HEIGHT}
            scrolling="no"
            style={{ pointerEvents: 'none' }}
          >
            {({ document: _doc }) => (
              <ThemeProvider {...stepTheme}>
                <JourneyProvider value={{ variant: 'embed' }}>
                  <Stack
                    justifyContent="center"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0
                    }}
                  >
                    <ThemeProvider
                      themeName={ThemeName.journeyUi}
                      themeMode={stepTheme.themeMode}
                      nested
                    >
                      <BlockRenderer block={data.step} />
                    </ThemeProvider>
                  </Stack>
                </JourneyProvider>
              </ThemeProvider>
            )}
          </FramePortal>
        </Box>
      </Box>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          background: theme.palette.grey[400],
          border: `2px solid ${theme.palette.background.paper}`,
          right: -5
        }}
      />
    </Box>
  )
}

function ShimmerOverlay(): ReactElement {
  return (
    <Box
      data-testid="ShimmerOverlay"
      sx={{
        position: 'absolute',
        top: 4,
        left: 4,
        right: 4,
        bottom: 4,
        zIndex: 10,
        borderRadius: 2,
        animation: 'pulse 2s infinite ease-in-out',
        '@keyframes pulse': {
          '0%, 100%': { bgcolor: 'rgba(197, 45, 58, 0.06)' },
          '50%': { bgcolor: 'rgba(197, 45, 58, 0.15)' }
        },
        bgcolor: 'rgba(197, 45, 58, 0.06)'
      }}
    />
  )
}
