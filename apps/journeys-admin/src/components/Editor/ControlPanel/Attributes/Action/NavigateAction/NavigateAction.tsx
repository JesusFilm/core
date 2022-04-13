import { ReactElement } from 'react'
import { useEditor } from '@core/journeys/ui'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { CardPreview } from '../../../../../CardPreview'

export function NavigateAction(): ReactElement {
  const {
    state: { steps, selectedStep }
  } = useEditor()

  const nextStep = steps?.find((step) => step.id === selectedStep?.nextBlockId)

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
        <CardPreview selected={nextStep} steps={steps} />
      </Box>
      <Stack
        direction={'row'}
        alignItems={'center'}
        spacing={3}
        sx={{ pt: 8 }}
        color={'text.secondary'}
      >
        <InfoOutlinedIcon />
        <Typography variant="caption">
          Default Next Step defined in the current card settings.
        </Typography>
      </Stack>
    </>
  )
}
