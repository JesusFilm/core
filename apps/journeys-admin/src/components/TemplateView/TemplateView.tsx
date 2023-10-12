import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Role } from '../../../__generated__/globalTypes'
import { useUserRoleQuery } from '../../libs/useUserRoleQuery'
import { StrategySection } from '../StrategySection'

import { TemplatePreviewTabs } from './TemplatePreviewTabs'
import { TemplateViewHeader } from './TemplateViewHeader/TemplateViewHeader'

interface TemplateViewProps {
  authUser: User
}

export function TemplateView({ authUser }: TemplateViewProps): ReactElement {
  const { journey } = useJourney()
  const { data } = useUserRoleQuery()
  const isPublisher = data?.getUserRole?.roles?.includes(Role.publisher)

  return (
    <Stack gap={4}>
      <TemplateViewHeader isPublisher={isPublisher} authUser={authUser} />
      <TemplatePreviewTabs />
      <Typography
        variant="body2"
        noWrap
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        {journey?.description}
      </Typography>
      {journey?.strategySlug != null && (
        <Stack sx={{ pt: { xs: 0, sm: 4 } }}>
          <StrategySection
            strategySlug={journey?.strategySlug}
            variant="full"
          />
        </Stack>
      )}
    </Stack>
  )
}
