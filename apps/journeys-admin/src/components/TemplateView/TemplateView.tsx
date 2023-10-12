import Stack from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Role } from '../../../__generated__/globalTypes'
import { useUserRoleQuery } from '../../libs/useUserRoleQuery'
import { StrategySection } from '../StrategySection'

import { CreateJourneyButton } from './CreateJourneyButton'
import { PreviewTemplateButton } from './PreviewTemplateButton'

interface TemplateViewProps {
  authUser: User
}

export function TemplateView({ authUser }: TemplateViewProps): ReactElement {
  const { data } = useUserRoleQuery()
  const { journey } = useJourney()
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  return (
    <Stack gap={4}>
      <Typography variant="h1">{journey?.title}</Typography>
      <Typography variant="body1">{journey?.description}</Typography>
      <CreateJourneyButton signedIn={authUser?.id != null} />
      <PreviewTemplateButton slug={journey?.slug} isPublisher={isPublisher} />
      {journey?.strategySlug != null && (
        <Stack sx={{ pt: 4 }}>
          <StrategySection
            strategySlug={journey?.strategySlug}
            variant="full"
          />
        </Stack>
      )}
    </Stack>
  )
}
