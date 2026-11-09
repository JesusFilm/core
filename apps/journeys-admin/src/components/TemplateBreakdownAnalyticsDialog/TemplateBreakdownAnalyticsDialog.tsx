import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { formatISO, isValid, parseISO, startOfToday } from 'date-fns'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useMemo, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

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
  const isDateRangeValid =
    startDate != null &&
    endDate != null &&
    isValid(startDate) &&
    isValid(endDate) &&
    startDate >= earliestDate &&
    endDate <= today &&
    startDate <= endDate
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const variables: GetTemplateFamilyStatsBreakdownVariables = useMemo(
    () => ({
      id: journeyId,
      idType: IdType.databaseId,
      where: {
        property: 'event:props:templateKey',
        period: 'custom',
        date:
          appliedDateRange ??
          `${earliestStatsCollected},${formatISO(today, {
            representation: 'date'
          })}`
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
    [journeyId, appliedDateRange, includeArchivedJourneys, today]
  )

  const { data, loading, error } = useQuery<
    GetTemplateFamilyStatsBreakdown,
    GetTemplateFamilyStatsBreakdownVariables
  >(GET_TEMPLATE_FAMILY_STATS_BREAKDOWN, {
    variables,
    skip: !open
  })

  const handleApplyDateRange = (): void => {
    if (!isDateRangeValid || startDate == null || endDate == null) return
    setAppliedDateRange(
      `${formatISO(startDate, { representation: 'date' })},${formatISO(endDate, { representation: 'date' })}`
    )
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
      data.templateFamilyStatsBreakdown.every((row) =>
        row.stats.every((stat) => stat.visitors === 0)
      ))

  return (
    <Dialog
      open={open}
      onClose={() => {
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
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          minDate={earliestDate}
          maxDate={today}
        />
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            disabled={!isDateRangeValid}
            onClick={handleApplyDateRange}
          >
            {t('Apply')}
          </Button>
          <Button
            onClick={handleClearDateRange}
            disabled={
              startDate == null && endDate == null && appliedDateRange == null
            }
          >
            {t('Clear')}
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ mt: 2 }} role="status">
          {appliedDateRange == null
            ? t('All time')
            : t('Date range: {{startDate}} to {{endDate}}', {
                startDate: appliedDateRange.split(',')[0],
                endDate: appliedDateRange.split(',')[1]
              })}
        </Typography>
        {startDate != null && endDate != null && !isDateRangeValid && (
          <Typography variant="body2" color="error" role="alert">
            {t(
              'Select a valid date range. The start date must be on or before the end date.'
            )}
          </Typography>
        )}
      </Box>
      {loading ? (
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
