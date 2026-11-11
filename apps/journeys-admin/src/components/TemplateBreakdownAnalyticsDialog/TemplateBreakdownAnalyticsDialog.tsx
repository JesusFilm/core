import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  formatISO,
  isValid,
  parseISO,
  startOfDay,
  startOfToday
} from 'date-fns'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import ArrowRotateLeft1Icon from '@core/shared/ui/icons/ArrowRotateLeft1'

import {
  GetTemplateFamilyStatsBreakdown,
  GetTemplateFamilyStatsBreakdownVariables
} from '../../../__generated__/GetTemplateFamilyStatsBreakdown'
import {
  IdType,
  JourneyStatus,
  PlausibleEvent
} from '../../../__generated__/globalTypes'
import { earliestStatsCollected } from '../Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch/buildPresetDateRange'
import { DateRangePicker } from '../JourneyVisitorsList/FilterDrawer/ExportDialog/DateRangePicker'

import { InfoIcon } from './InfoIcon'
import { TemplateBreakdownAnalyticsTable } from './TemplateBreakdownAnalyticsTable'

interface TemplateBreakdownAnalyticsDialogProps {
  journeyId: string
  open: boolean
  handleClose: () => void
}

export const GET_TEMPLATE_FAMILY_STATS_BREAKDOWN = gql`
  query GetTemplateFamilyStatsBreakdown(
    $id: ID!
    $idType: IdType
    $where: PlausibleStatsBreakdownFilter!
    $events: [PlausibleEvent!]
    $status: [JourneyStatus!]
  ) {
    templateFamilyStatsBreakdown(
      id: $id
      idType: $idType
      where: $where
      events: $events
      status: $status
    ) {
      journeyId
      journeyName
      teamName
      status
      stats {
        event
        visitors
      }
    }
  }
`

export function TemplateBreakdownAnalyticsDialog({
  journeyId,
  open,
  handleClose
}: TemplateBreakdownAnalyticsDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [includeArchivedJourneys, setIncludeArchivedJourneys] = useState(true)
  const today = useMemo(() => startOfToday(), [])
  const earliestDate = useMemo(() => parseISO(earliestStatsCollected), [])
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [appliedDateRange, setAppliedDateRange] = useState<string | null>(null)
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const getValidDateRange = (
    from: Date | null,
    to: Date | null
  ): string | null => {
    if (
      from == null ||
      to == null ||
      !isValid(from) ||
      !isValid(to) ||
      startOfDay(from) < earliestDate ||
      startOfDay(to) > today ||
      startOfDay(from) > startOfDay(to)
    )
      return null
    return `${formatISO(from, { representation: 'date' })},${formatISO(to, { representation: 'date' })}`
  }

  const isDateRangeValid = getValidDateRange(startDate, endDate) != null

  const selectedDateRange = getValidDateRange(startDate, endDate)
  const hasDateInput = startDate != null || endDate != null
  const isRangeIncomplete = hasDateInput && !isDateRangeValid
  const isRangePending =
    selectedDateRange != null && selectedDateRange !== appliedDateRange
  useEffect(() => {
    if (
      !open ||
      selectedDateRange == null ||
      selectedDateRange === appliedDateRange
    )
      return
    const timer = setTimeout(() => setAppliedDateRange(selectedDateRange), 500)
    return () => clearTimeout(timer)
  }, [open, selectedDateRange, appliedDateRange])

  const variables: GetTemplateFamilyStatsBreakdownVariables = useMemo(
    () => ({
      id: journeyId,
      idType: IdType.databaseId,
      where: {
        property: 'event:props:templateKey',
        period: appliedDateRange == null ? 'all' : 'custom',
        ...(appliedDateRange != null ? { date: appliedDateRange } : {})
      },
      events: [
        PlausibleEvent.journeyVisitors,
        PlausibleEvent.journeyResponses,
        PlausibleEvent.prayerRequestCapture,
        PlausibleEvent.christDecisionCapture,
        PlausibleEvent.gospelStartCapture,
        PlausibleEvent.gospelCompleteCapture,
        PlausibleEvent.rsvpCapture,
        PlausibleEvent.specialVideoStartCapture,
        PlausibleEvent.specialVideoCompleteCapture,
        PlausibleEvent.custom1Capture,
        PlausibleEvent.custom2Capture,
        PlausibleEvent.custom3Capture
      ],
      status: includeArchivedJourneys
        ? [JourneyStatus.published, JourneyStatus.draft, JourneyStatus.archived]
        : [JourneyStatus.published, JourneyStatus.draft]
    }),
    [journeyId, appliedDateRange, includeArchivedJourneys]
  )

  const { data, loading, error } = useQuery<
    GetTemplateFamilyStatsBreakdown,
    GetTemplateFamilyStatsBreakdownVariables
  >(GET_TEMPLATE_FAMILY_STATS_BREAKDOWN, {
    variables,
    skip: !open || isRangeIncomplete || isRangePending
  })

  const handleDateRangeChange = (from: Date | null, to: Date | null): void => {
    setStartDate(from)
    setEndDate(to)
    if (from == null && to == null) setAppliedDateRange(null)
  }

  const handleClearDateRange = (): void => {
    setStartDate(null)
    setEndDate(null)
    setAppliedDateRange(null)
  }

  const noData =
    !loading &&
    !error &&
    (data?.templateFamilyStatsBreakdown == null ||
      data.templateFamilyStatsBreakdown.length === 0)

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClearDateRange()
        setIncludeArchivedJourneys(true)
        handleClose()
      }}
      dialogTitle={{
        title: t('Template Breakdown Analytics'),
        closeButton: true,
        icon: <InfoIcon />
      }}
      divider
      fullscreen={mdDown}
      maxWidth="xl"
      dialogActionChildren={
        <FormGroup
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            px: 4
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={includeArchivedJourneys}
                onChange={(_, checked) => setIncludeArchivedJourneys(checked)}
              />
            }
            label={t('Include archived projects')}
          />
        </FormGroup>
      }
      sx={{
        '& .MuiDialogContent-dividers': {
          px: 0
        },
        '& .MuiDialogContent-root': {
          pt: 4
        },
        '& .MuiDialog-paper': {
          width: mdDown ? '100%' : 'fit-content',
          minWidth: mdDown ? null : '800px',
          minHeight: mdDown ? null : '600px'
        }
      }}
    >
      <Box sx={{ px: 4, pb: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center' }}>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={(date) => handleDateRangeChange(date, endDate)}
            onEndDateChange={(date) => handleDateRangeChange(startDate, date)}
            minDate={earliestDate}
            maxDate={today}
          />
          {(startDate != null ||
            endDate != null ||
            appliedDateRange != null) && (
            <Tooltip title={t('Reset date range')}>
              <IconButton
                aria-label={t('Reset date range')}
                onClick={handleClearDateRange}
              >
                <ArrowRotateLeft1Icon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {startDate != null && endDate != null && !isDateRangeValid && (
          <Typography variant="body2" color="error" role="alert">
            {t(
              'Select a valid date range. The start date must be on or before the end date.'
            )}
          </Typography>
        )}
      </Box>
      {isRangeIncomplete ? (
        <Typography variant="body1" align="center" sx={{ px: 4, py: 6 }}>
          {t('Select a valid From and To date to view analytics')}
        </Typography>
      ) : loading || isRangePending ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            px: 4
          }}
        >
          <CircularProgress />
        </Box>
      ) : error != null ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            px: 4
          }}
        >
          <Typography variant="body1" align="center">
            {t('There was an error loading the stats')}
          </Typography>
        </Box>
      ) : noData ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
            px: 4
          }}
        >
          <Typography variant="body1" align="center">
            {t('No template breakdown analytics data available')}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 6 }}>
          <TemplateBreakdownAnalyticsTable
            data={data}
            loading={loading}
            error={error}
          />
        </Box>
      )}
    </Dialog>
  )
}
