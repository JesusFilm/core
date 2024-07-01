import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyAnalyticsQuery } from '@core/journeys/ui/useJourneyAnalyticsQuery'
import { formatISO } from 'date-fns'
import { usePlausibleLocal } from '../../../../PlausibleLocalProvider'

export function AnalyticsOverlaySwitch(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { showAnalytics },
    dispatch
  } = useEditor()

  const {
    state: { period, date, periodRange }
  } = usePlausibleLocal()
  let filterPeriod = period
  let filterDate = formatISO(date, { representation: 'date' })

  if (period === 'all') {
    filterPeriod = 'custom'
    filterDate = `2024-06-01,${formatISO(date, { representation: 'date' })}`
  } else if (period === 'custom') {
    if (periodRange?.from != null && periodRange?.to != null) {
      filterDate = `${formatISO(periodRange.from, { representation: 'date' })},${formatISO(periodRange.to, { representation: 'date' })}`
    }
  }

  useJourneyAnalyticsQuery({
    variables: {
      id: journey?.id ?? '',
      period: filterPeriod,
      date: filterDate
    },
    skip: journey?.id == null || showAnalytics !== true,
    onCompleted: (analytics) => {
      dispatch({
        type: 'SetAnalyticsAction',
        analytics
      })
    }
  })

  function handleSwitchAnalytics(): void {
    dispatch({
      type: 'SetShowAnalyticsAction',
      showAnalytics: showAnalytics !== true
    })
  }

  return (
    <FormControlLabel
      control={
        <Switch
          checked={showAnalytics === true}
          onChange={handleSwitchAnalytics}
        />
      }
      label={
        <Typography variant="subtitle2">{t('Analytics Overlay')}</Typography>
      }
      labelPlacement="start"
    />
  )
}
