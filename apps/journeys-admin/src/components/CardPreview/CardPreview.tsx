import Box from '@mui/material/Box'
import { ReactElement } from 'react'
import { BlockRenderer, TreeBlock } from '@core/journeys/ui'
import { ThemeProvider } from '@core/shared/ui'
import { FramePortal } from '../FramePortal'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../__generated__/GetJourney'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'
import { HorizontalSelect } from '../HorizontalSelect'

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
  const handleChange = (selectedId: string): void => {
    const selectedStep = steps.find(({ id }) => id === selectedId)
    selectedStep != null && onSelect?.(selectedStep)
  }
  return (
    <HorizontalSelect onChange={handleChange} id={selected?.id}>
      {steps.map((step) => (
        <Box
          id={step.id}
          key={step.id}
          data-testid={`preview-${step.id}`}
          sx={{
            width: 95,
            height: 140
          }}
        >
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
                  <BlockRenderer block={step} />
                </Box>
              </ThemeProvider>
            </FramePortal>
          </Box>
        </Box>
      ))}
    </HorizontalSelect>
  )
}
