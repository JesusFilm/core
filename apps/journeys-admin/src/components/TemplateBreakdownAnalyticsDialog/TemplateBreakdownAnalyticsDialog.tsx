import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import { Theme } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { formatISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
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
import { earliestStatsCollected } from '../Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch'

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
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'))

  const defaultVariables: GetTemplateFamilyStatsBreakdownVariables = useMemo(
    () => ({
      id: journeyId,
      idType: IdType.databaseId,
      where: {
        property: 'event:props:templateKey',
        period: 'custom',
        date: `${earliestStatsCollected},${formatISO(new Date(), {
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
      status: [
        JourneyStatus.published,
        JourneyStatus.draft,
        JourneyStatus.archived
      ]
    }),
    [journeyId]
  )

  const { data, loading, error, refetch } = useQuery<
    GetTemplateFamilyStatsBreakdown,
    GetTemplateFamilyStatsBreakdownVariables
  >(GET_TEMPLATE_FAMILY_STATS_BREAKDOWN, {
    variables: defaultVariables,
    skip: !open
  })

  const handleToggleArchivedJourneys = (): void => {
    const newIncludeArchived = !includeArchivedJourneys
    setIncludeArchivedJourneys(newIncludeArchived)
    if (open) {
      void refetch({
        ...defaultVariables,
        status: newIncludeArchived
          ? [
              JourneyStatus.published,
              JourneyStatus.draft,
              JourneyStatus.archived
            ]
          : [JourneyStatus.published, JourneyStatus.draft]
      })
    }
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
                onChange={handleToggleArchivedJourneys}
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
