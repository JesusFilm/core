import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { EmbedJourney } from './EmbedJourney'

export function DiscoveryJourneys(): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={8}
      sx={{
        justifyContent: 'center',
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: { xs: 0, sm: 3 },
        mt: 8,
        p: 4
      }}
    >
      <Stack sx={{ alignItems: 'center' }}>
        <EmbedJourney slug="onboarding-vision" />
        <Typography>Vision</Typography>
      </Stack>

      <Stack sx={{ alignItems: 'center' }}>
        <EmbedJourney slug="onboarding-how-to" />
        <Typography>How To</Typography>
      </Stack>

      <Stack sx={{ alignItems: 'center' }}>
        <EmbedJourney slug="onboarding-feedback" />
        <Typography>Feedback</Typography>
      </Stack>
    </Stack>
  )
}
