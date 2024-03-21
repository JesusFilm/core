import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { JourneysReportType } from '../../../__generated__/globalTypes'

import { NavigationButton } from './NavigationButton'

interface ReportsNavigationProps {
  reportType?: JourneysReportType
  journeyId?: string
  selected: 'journeys' | 'visitors'
}

export function ReportsNavigation({
  reportType,
  journeyId,
  selected
}: ReportsNavigationProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      direction="row"
      spacing={4}
      sx={{ pb: 8 }}
      data-testid="JourneysAdminReportsNavigation"
    >
      <NavigationButton
        selected={selected === 'journeys'}
        value={t('Journeys')}
        link={
          reportType === JourneysReportType.singleFull &&
          journeyId !== undefined
            ? `/journeys/${journeyId}/reports`
            : '/reports/journeys'
        }
      />
      <NavigationButton
        selected={selected === 'visitors'}
        value={t('Visitors')}
        link={
          reportType === JourneysReportType.singleFull &&
          journeyId !== undefined
            ? `/journeys/${journeyId}/reports/visitors`
            : '/reports/visitors'
        }
      />
    </Stack>
  )
}
