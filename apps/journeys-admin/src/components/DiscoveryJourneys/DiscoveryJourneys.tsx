import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { EmbedJourney } from './EmbedJourney'

export function DiscoveryJourneys(): ReactElement {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-evenly' }}>
      <EmbedJourney slug="admin-left" />
      <EmbedJourney slug="admin-center" />
      <EmbedJourney slug="admin-right" />
    </Stack>
  )
}
