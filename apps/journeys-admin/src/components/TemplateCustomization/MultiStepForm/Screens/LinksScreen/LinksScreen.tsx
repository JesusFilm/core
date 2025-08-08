import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

interface LinksScreenProps {
  handleNext: () => void
}

export function LinksScreen({ handleNext }: LinksScreenProps): ReactElement {
  return (
    <Stack>
      <Typography variant="h4" component="h1" gutterBottom>
        Links Configuration
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Configure the links and navigation for your journey template.
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
