import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

interface LanguageScreenProps {
  handleNext: () => void
}

export function LanguageScreen({
  handleNext
}: LanguageScreenProps): ReactElement {
  return (
    <Stack>
      <Typography variant="h4" component="h1" gutterBottom>
        Language Selection
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Choose your preferred language for the journey template.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleNext}
        sx={{ width: '300px', alignSelf: 'center', mt: 4 }}
      >
        <ArrowRightIcon />
      </Button>
    </Stack>
  )
}
