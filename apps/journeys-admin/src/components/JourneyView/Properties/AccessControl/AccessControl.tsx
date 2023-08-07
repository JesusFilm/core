import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { AccessAvatars } from '../../../AccessAvatars'

export function AccessControl(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        {t('Access Control')}
      </Typography>
      <AccessAvatars
        journeyId={journey?.id}
        userJourneys={journey?.userJourneys ?? undefined}
        size="medium"
        xsMax={5}
        showManageButton
      />
    </>
  )
}
