import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { NavigationButton } from './NavigationButton'

interface Props {
  selected: 'journeys' | 'visitors'
}

export function ReportsNavigation({ selected }: Props): ReactElement {
  const { t } = useTranslation('journeys-admin')
  return (
    <Stack direction="row" spacing={4} sx={{ pb: 8 }}>
      <NavigationButton
        selected={selected === 'journeys'}
        value={t('Journeys')}
        link="/reports/journeys"
      />
      <NavigationButton
        selected={selected === 'visitors'}
        value={t('Visitors')}
        link="/reports/visitors"
      />
    </Stack>
  )
}
