import Stack from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { AuthUser } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { CreateJourneyButton } from './CreateJourneyButton'

interface TemplateViewProps {
  authUser: AuthUser
}

export function TemplateView({ authUser }: TemplateViewProps): ReactElement {
  const { journey } = useJourney()

  return (
    <Stack gap={4}>
      <Typography variant="h1">{journey?.title}</Typography>
      <Typography variant="body1">{journey?.description}</Typography>
      <CreateJourneyButton signedIn={authUser.id != null} />
    </Stack>
  )
}
