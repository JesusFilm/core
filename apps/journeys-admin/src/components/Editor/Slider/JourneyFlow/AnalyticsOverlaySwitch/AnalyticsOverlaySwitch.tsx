import Button from '@mui/material/Button'
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
import FilterIcon from '@core/shared/ui/icons/Filter'

import { DateRangePicker } from '../../../../JourneyVisitorsList/FilterDrawer/ExportDialog/DateRangePicker'

import { AnalyticsOverlayDateRangeSelect } from './AnalyticsOverlayDateRangeSelect'
import { buildPlausibleDateRange } from './buildPlausibleDateRange'
import {
  DateRangePresetId,
  buildPresetDateRange,
  earliestStatsCollected
} from './buildPresetDateRange'

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
  const [showFilter, setShowFilter] = useState<boolean>(false)
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [selectedPreset, setSelectedPreset] =
    useState<DateRangePresetId>('allTime')

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
      enqueueSnackbar(t('Error fetching analytics'), {
        variant: 'error',
        preventDuplicate: true
      })
    }
  })

  function handlePresetChange(preset: DateRangePresetId): void {
    setSelectedPreset(preset)

    if (preset !== 'customRange') {
      const { startDate: newStartDate, endDate: newEndDate } =
        buildPresetDateRange(preset)
      setStartDate(newStartDate)
      setEndDate(newEndDate)
    }
  }

  function handleSwitchAnalytics(): void {
    dispatch({
      type: 'SetShowAnalyticsAction',
      showAnalytics: showAnalytics !== true
    })
  }

  return (
    <Stack direction="column" spacing={2} alignItems="flex-start">
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControlLabel
          control={
            <Switch
              checked={showAnalytics === true}
              onChange={handleSwitchAnalytics}
            />
          }
          label={
            <Typography variant="subtitle2">
              {t('Analytics Overlay')}
            </Typography>
          }
          labelPlacement="start"
        />
        {showAnalytics === true && <FilterIcon />}
        {showAnalytics === true && !showFilter && (
          <Button
            variant="text"
            color="secondary"
            onClick={() => setShowFilter(true)}
            sx={{
              minWidth: 80
            }}
          >
            <Typography
              variant="subtitle2"
              component="span"
              sx={{
                display: 'inline-block',
                maxWidth: 200,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                verticalAlign: 'bottom'
              }}
            >
              {t('Filter')}
            </Typography>
          </Button>
        )}
        {showAnalytics === true && showFilter && (
          <AnalyticsOverlayDateRangeSelect
            value={selectedPreset}
            onChange={handlePresetChange}
          />
        )}
      </Stack>
      {showAnalytics === true && selectedPreset === 'customRange' && (
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
