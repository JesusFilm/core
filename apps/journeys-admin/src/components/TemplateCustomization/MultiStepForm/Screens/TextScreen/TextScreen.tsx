import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

interface TextScreenProps {
  handleNext: () => void
}

export function TextScreen({ handleNext }: TextScreenProps): ReactElement {
  return (
    <Stack>
      <Typography variant="h4" component="h1" gutterBottom>
        Text Customization
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Customize the text content for your journey template.
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
