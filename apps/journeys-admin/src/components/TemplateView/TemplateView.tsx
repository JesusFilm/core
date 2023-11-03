import Container from '@mui/material/Container'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Role } from '../../../__generated__/globalTypes'
import { useJourneysQuery } from '../../libs/useJourneysQuery'
import { useUserRoleQuery } from '../../libs/useUserRoleQuery'
import { StrategySection } from '../StrategySection'
import { TemplateSection } from '../TemplateSections/TemplateSection'

import { TemplateFooter } from './TemplateFooter'
import { TemplatePreviewTabs } from './TemplatePreviewTabs'
import { TemplateTags } from './TemplateTags'
import { TemplateViewHeader } from './TemplateViewHeader/TemplateViewHeader'

interface TemplateViewProps {
  authUser: User
}

export function TemplateView({ authUser }: TemplateViewProps): ReactElement {
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')

  const tagIds = journey?.tags.map((tag) => tag.id)
  const { data } = useJourneysQuery({
    variables: {
      where: {
        template: true,
        orderByRecent: true,
        tagIds
      }
    }
  })

  const relatedJourneys = data?.journeys.filter(({ id }) => id !== journey?.id)

  const { data: userData } = useUserRoleQuery()
  const isPublisher = userData?.getUserRole?.roles?.includes(Role.publisher)

  return (
    <Container disableGutters>
      <Stack sx={{ gap: { xs: 3, sm: 7 } }}>
        <TemplateViewHeader isPublisher={isPublisher} authUser={authUser} />
        <TemplateTags tags={journey?.tags} />
        <TemplatePreviewTabs />
        <Typography
          variant="body2"
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          {journey?.description != null ? (
            journey.description
          ) : (
            <>
              {[0, 1, 2].map((value) => (
                <Skeleton
                  key={value}
                  data-testid="TemplateViewDescriptionSkeleton"
                  width="100%"
                />
              ))}
            </>
          )}
        </Typography>
        {journey?.strategySlug != null && (
          <StrategySection
            strategySlug={journey?.strategySlug}
            variant="full"
          />
        )}
        {relatedJourneys != null && relatedJourneys.length >= 1 && (
          <TemplateSection
            category={t('Related Templates')}
            journeys={relatedJourneys}
          />
        )}
        <TemplateFooter signedIn={authUser?.id != null} />
      </Stack>
    </Container>
  )
}
