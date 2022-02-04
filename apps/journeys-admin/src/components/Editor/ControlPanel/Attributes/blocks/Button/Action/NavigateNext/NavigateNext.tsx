import { ReactElement } from 'react'
import { useEditor } from '@core/journeys/ui'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { CardPreview } from '../../../../../../../CardPreview'

export function NavigateNext(): ReactElement {
  const { state } = useEditor()

  // update mutation to set action to navigate to next step
  const nextStep = state.steps.find(
    (step) => step.id === state.selectedStep?.nextBlockId
  )

  return (
    <>
      {nextStep != null ? (
        <Box
          sx={{
            display: 'absolute',
            backgroundColor: 'white',
            opacity: '40%'
          }}
        >
          <CardPreview selected={nextStep} steps={state.steps} />
        </Box>
      ) : (
        <Typography variant="caption">No next step</Typography>
      )}
    </>
  )
}
