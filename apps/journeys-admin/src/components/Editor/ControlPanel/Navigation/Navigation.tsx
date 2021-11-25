import { Box, Stack } from '@mui/material'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourneyForEdit'
import { ReactElement } from 'react'
import { Actions } from './Actions'
import { BlockRenderer, TreeBlock } from '@core/journeys/ui'
import { FramePortal } from '../../../FramePortal'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeName, ThemeMode } from '../../../../../__generated__/globalTypes'

export interface NavigationProps {
  onSelect?: (card: TreeBlock<StepBlock>) => void
  selectedStep?: TreeBlock<StepBlock>
  steps: Array<TreeBlock<StepBlock>>
}

export function Navigation({
  steps,
  selectedStep,
  onSelect
}: NavigationProps): ReactElement {
  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          overflowX: 'auto',
          p: 4
        }}
      >
        {steps.map((step) => (
          <Box
            key={step.id}
            sx={{
              p: 1,
              borderRadius: 2,
              transition: '0.2s border-color ease-out',
              position: 'relative',
              width: 89,
              height: 134,
              boxSizing: 'content-box',
              border: (theme) =>
                selectedStep?.id === step.id
                  ? `3px ${theme.palette.primary.main} solid`
                  : `3px ${theme.palette.background.default} solid`
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
              <Box
                sx={{
                  width: 356,
                  height: 536
                }}
              >
                <FramePortal id={step.id}>
                  <ThemeProvider
                    themeName={ThemeName.base}
                    themeMode={ThemeMode.light}
                  >
                    <BlockRenderer {...step} />
                  </ThemeProvider>
                </FramePortal>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
      <Actions />
    </>
  )
}
