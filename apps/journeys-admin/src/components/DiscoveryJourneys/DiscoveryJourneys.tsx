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
        borderRadius: 3,
        mt: 16,
        p: 4
      }}
    >
      <Stack sx={{ alignItems: 'center' }}>
        <EmbedJourney slug="fact-or-fiction" />
        <Typography>Vision</Typography>
      </Stack>

      <Stack sx={{ alignItems: 'center' }}>
        <EmbedJourney slug="what-about-the-resurrection" />
        <Typography>How To</Typography>
      </Stack>

      <Stack sx={{ alignItems: 'center' }}>
        <EmbedJourney slug="whats-jesus-got-to-do-with-me" />
        <Typography>Feedback</Typography>
      </Stack>
    </Stack>
  )
}
