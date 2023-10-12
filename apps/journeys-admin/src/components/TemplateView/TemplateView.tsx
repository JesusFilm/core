import Stack from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { User } from 'next-firebase-auth'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { useJourneysQuery } from '../../libs/useJourneysQuery'
import { StrategySection } from '../StrategySection'
import { TemplateSection } from '../TemplateSections/TemplateSection'

import { CreateJourneyButton } from './CreateJourneyButton'
import { TemplateFooter } from './TemplateFooter'
import { TemplatePreviewTabs } from './TemplatePreviewTabs'

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

  return (
    <Stack gap={4}>
      <Typography variant="h1">{journey?.title}</Typography>
      <Typography variant="body1">{journey?.description}</Typography>
      <CreateJourneyButton signedIn={authUser?.id != null} />
      <Stack sx={{ pt: 4 }}>
        <TemplatePreviewTabs />
      </Stack>
      {journey?.strategySlug != null && (
        <Stack sx={{ pt: { xs: 0, sm: 4 } }}>
          <StrategySection
            strategySlug={journey?.strategySlug}
            variant="full"
          />
        </Stack>
      )}
      {relatedJourneys != null && relatedJourneys.length > 1 && (
        <TemplateSection
          category={t('Related Templates')}
          journeys={relatedJourneys}
        />
      )}
      <TemplateFooter signedIn={authUser?.id != null} />
    </Stack>
  )
}
