import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { EmbedJourney } from './EmbedJourney'

export function DiscoveryJourneys(): ReactElement {
  return (
    <Stack direction="row">
      <EmbedJourney slug="fact-or-fiction" />
      <EmbedJourney slug="what-about-the-resurrection" />
      <EmbedJourney slug="whats-jesus-got-to-do-with-me" />
    </Stack>
  )
}
