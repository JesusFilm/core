import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

export function WebsiteToggle(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  function handleChange(): void {
    console.log('handleChange')
  }

  return (
    <ToggleButtonGroup
      value={journey?.website === true ? 'website' : 'journey'}
      exclusive
      onChange={handleChange}
    >
      <ToggleButton value="journey">{t('Journey')}</ToggleButton>
      <ToggleButton value="website">{t('Website')}</ToggleButton>
    </ToggleButtonGroup>
  )
}
