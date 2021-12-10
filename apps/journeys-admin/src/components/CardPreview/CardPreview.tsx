import { Box, Stack } from '@mui/material'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourneyForEdit'
import { ReactElement } from 'react'
import { BlockRenderer, TreeBlock } from '@core/journeys/ui'
import { FramePortal } from '../FramePortal'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'

export interface CardPreviewProps {
  onSelect?: (card: TreeBlock<StepBlock>) => void
  selected?: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

export function CardPreview({
  steps,
  selected,
  onSelect
}: CardPreviewProps): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        overflowX: 'auto',
        py: 5,
        px: 6
      }}
    >
      {steps.map((step) => (
        <Box
          key={step.id}
          data-testid={`step-${step.id}`}
          sx={{
            borderRadius: 2,
            transition: '0.2s border-color ease-out',
            position: 'relative',
            maxWidth: 95,
            minWidth: 95,
            height: 140,
            boxSizing: 'content-box',
            overflow: 'hidden',
            border: (theme) =>
              selected?.id === step.id
                ? `3px solid ${theme.palette.primary.main} `
                : `3px solid ${theme.palette.background.default}`
          }}
          onClick={() => onSelect?.(step)}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 1
            }}
          />
          <Box
            sx={{
              transform: 'scale(0.25)',
              transformOrigin: 'top left'
            }}
          >
            <FramePortal width={380} height={560}>
              <ThemeProvider
                themeName={ThemeName.base}
                themeMode={ThemeMode.light}
              >
                <Box sx={{ p: 4, height: '100%' }}>
                  <BlockRenderer {...step} />
                </Box>
              </ThemeProvider>
            </FramePortal>
          </Box>
        </Box>
      ))}
    </Stack>
  )
}
