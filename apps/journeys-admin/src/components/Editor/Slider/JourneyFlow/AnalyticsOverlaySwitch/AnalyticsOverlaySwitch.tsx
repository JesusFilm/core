import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { formatISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyAnalyticsQuery } from '@core/journeys/ui/useJourneyAnalyticsQuery'

// Used to for filter all time stats
export const earliestStatsCollected = '2024-06-01'

export function AnalyticsOverlaySwitch(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { showAnalytics },
    dispatch
  } = useEditor()
  const currentDate = formatISO(new Date(), { representation: 'date' })

  useJourneyAnalyticsQuery({
    variables: {
      id: journey?.id ?? '',
      period: 'custom',
      date: `${earliestStatsCollected},${currentDate}`
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
