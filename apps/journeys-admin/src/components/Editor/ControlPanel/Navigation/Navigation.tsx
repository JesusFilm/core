import { Box, Stack } from '@mui/material'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourneyForEdit'
import { ReactElement } from 'react'
import { Actions } from './Actions'
import { BlockRenderer, TreeBlock } from '@core/journeys/ui'

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
        spacing={4}
        sx={{
          overflowX: 'auto',
          p: 6
        }}
      >
        {steps.map((step) => (
          <Box
            key={step.id}
            sx={{
              p: 1,
              borderRadius: 2,
              minWidth: 113,
              maxWidth: 113,
              height: 200,
              transition: '0.2s border-color ease-out',
              position: 'relative',
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
                transform: 'scale(0.33)',
                transformOrigin: 'top left'
              }}
            >
              <Box
                sx={{
                  width: {
                    xs: 296,
                    sm: 476,
                    md: 854
                  },
                  height: {
                    xs: 560,
                    sm: 880,
                    md: 480
                  }
                }}
              >
                <BlockRenderer {...step} />
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
      <Actions />
    </>
  )
}
