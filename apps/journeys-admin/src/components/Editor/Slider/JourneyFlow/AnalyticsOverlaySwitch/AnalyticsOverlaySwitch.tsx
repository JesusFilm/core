import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import formatISO from 'date-fns/formatISO'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyAnalyticsQuery } from '@core/journeys/ui/useJourneyAnalyticsQuery'
import { usePlausibleLocal } from '../../../../PlausibleLocalProvider'

export function AnalyticsOverlaySwitch(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { state } = usePlausibleLocal()

  const {
    state: { showAnalytics },
    dispatch
  } = useEditor()

  let period = state.period
  let date = formatISO(state.date, { representation: 'date' })

  if (state.period === 'all') {
    period = 'custom'
    date = `2024-06-01,${formatISO(state.date, { representation: 'date' })}`
  } else if (state.period === 'custom') {
    if (state.periodRange?.from != null && state.periodRange?.to != null) {
      date = `${formatISO(state.periodRange.from, { representation: 'date' })},${formatISO(state.periodRange.to, { representation: 'date' })}`
    }
  }

  useJourneyAnalyticsQuery({
    variables: {
      id: journey?.id ?? '',
      period,
      date
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
