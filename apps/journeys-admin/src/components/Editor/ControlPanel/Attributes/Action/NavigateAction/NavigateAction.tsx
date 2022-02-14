import { ReactElement } from 'react'
import { useEditor } from '@core/journeys/ui'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { CardPreview } from '../../../../../CardPreview'

export function NavigateAction(): ReactElement {
  const { state } = useEditor()

  const nextStep = state.steps.find(
    (step) => step.id === state.selectedStep?.nextBlockId
  )

  return (
    <>
      <Box
        sx={{
          display: 'absolute',
          backgroundColor: 'white',
          opacity: '40%'
        }}
        data-testid="cards-disabled-view"
      >
        <CardPreview selected={nextStep} steps={state.steps} />
      </Box>
      {nextStep == null && (
        <Typography variant="caption">No next card</Typography>
      )}
    </>
  )
}
