import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyAnalyticsQuery } from '@core/journeys/ui/useJourneyAnalyticsQuery'

import { DateRangePicker } from '../../../../JourneyVisitorsList/FilterDrawer/ExportDialog/DateRangePicker'

import { buildPlausibleDateRange } from './buildPlausibleDateRange'

// Used to for filter all time stats
export const earliestStatsCollected = '2024-06-01'

export function AnalyticsOverlaySwitch(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { showAnalytics },
    dispatch
  } = useEditor()

  const [startDate, setStartDate] = useState<Date | null>(
    new Date(earliestStatsCollected)
  )
  const [endDate, setEndDate] = useState<Date | null>(new Date())

  const isDateRangeValid =
    startDate != null && endDate != null && startDate <= endDate

  const formattedDateRange = buildPlausibleDateRange(
    startDate,
    endDate,
    earliestStatsCollected,
    new Date()
  )

  useJourneyAnalyticsQuery({
    variables: {
      id: journey?.id ?? '',
      period: 'custom',
      date: formattedDateRange
    },
    skip:
      journey?.id == null ||
      showAnalytics !== true ||
      isDateRangeValid !== true,
    onCompleted: (analytics) => {
      dispatch({
        type: 'SetAnalyticsAction',
        analytics
      })
    },
    onError: (_) => {
      if (isDateRangeValid) {
        enqueueSnackbar(t('Invalid date range'), {
          variant: 'error',
          preventDuplicate: true
        })
        return
      }
      enqueueSnackbar(t('Error fetching analytics'), {
        variant: 'error',
        preventDuplicate: true
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
    <Stack direction="column" spacing={2} alignItems="flex-start">
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
      {showAnalytics && (
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      )}
    </Stack>
  )
}
