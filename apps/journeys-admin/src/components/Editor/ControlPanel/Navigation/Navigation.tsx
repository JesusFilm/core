import { Box, Card, Stack } from '@mui/material'
import {
  GetJourneyForEdit_journey_blocks as Block,
  GetJourneyForEdit_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourneyForEdit'
import { ReactElement } from 'react'
import { Actions } from './Actions'
import { TreeBlock } from '@core/shared/ui'

export interface NavigationProps {
  onSelect?: (card: TreeBlock<StepBlock, Block>) => void
  selectedStep?: TreeBlock<StepBlock, Block>
  steps: Array<TreeBlock<StepBlock, Block>>
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
              borderRadius: 4,
              minWidth: 95,
              maxWidth: 95,
              height: 140,
              border: (theme) =>
                selectedStep?.id === step.id
                  ? `3px ${theme.palette.primary.main} solid`
                  : '3px transparent solid'
            }}
          >
            <Card
              onClick={() => onSelect?.(step)}
              sx={{
                borderRadius: 2,
                width: '100%',
                height: '100%'
              }}
            >
              Hello World
            </Card>
          </Box>
        ))}
      </Stack>
      <Actions />
    </>
  )
}
