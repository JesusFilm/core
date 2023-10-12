import Stack from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StrategySection } from '../StrategySection'

import { CreateJourneyButton } from './CreateJourneyButton'
import { TemplateFooter } from './TemplateFooter'

interface TemplateViewProps {
  authUser: User
}

export function TemplateView({ authUser }: TemplateViewProps): ReactElement {
  const { journey } = useJourney()

  return (
    <Stack gap={4}>
      <Typography variant="h1">{journey?.title}</Typography>
      <Typography variant="body1">{journey?.description}</Typography>
      <CreateJourneyButton signedIn={authUser?.id != null} />
      {journey?.strategySlug != null && (
        <Stack sx={{ pt: 4 }}>
          <StrategySection
            strategySlug={journey?.strategySlug}
            variant="full"
          />
        </Stack>
      )}
      <TemplateFooter signedIn={authUser?.id != null} />
    </Stack>
  )
}
