import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { AuthUser } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { UseTemplateButton } from './UseTemplateButton'

interface TemplateViewProps {
  authUser: AuthUser
}

export function TemplateView({ authUser }: TemplateViewProps): ReactElement {
  const { journey } = useJourney()

  return (
    <Box>
      <Typography variant="h1">{journey?.title}</Typography>
      <Typography variant="body1">{journey?.description}</Typography>
      <UseTemplateButton signedIn={authUser.id != null} />
    </Box>
  )
}
