import { gql, useQuery } from '@apollo/client'
import { formatISO } from 'date-fns'
import { ReactElement, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { Dialog } from '@core/shared/ui/Dialog'

import {
  GetTemplateFamilyStatsBreakdown,
  GetTemplateFamilyStatsBreakdownVariables
} from '../../../__generated__/GetTemplateFamilyStatsBreakdown'
import { earliestStatsCollected } from '../Editor/Slider/JourneyFlow/AnalyticsOverlaySwitch'
import {
  IdType,
  JourneyStatus,
  PlausibleEvent
} from '../../../__generated__/globalTypes'
import Box from '@mui/material/Box'
import FormGroup from '@mui/material/FormGroup'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'

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

  useEffect(() => {
    if (open) {
      void refetch({
        ...defaultVariables,
        status: includeArchivedJourneys
          ? [
              JourneyStatus.published,
              JourneyStatus.draft,
              JourneyStatus.archived
            ]
          : [JourneyStatus.published, JourneyStatus.draft]
      })
    }
  }, [includeArchivedJourneys, refetch, open, journeyId])

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dialogTitle={{ title: 'Template Breakdown Analytics', closeButton: true }}
      divider
      maxWidth="xl"
      dialogActionChildren={
        <FormGroup
          sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start' }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={includeArchivedJourneys}
                onChange={() =>
                  setIncludeArchivedJourneys(!includeArchivedJourneys)
                }
              />
            }
            label="Include archived journeys"
          />
        </FormGroup>
      }
      sx={{
        '& .MuiDialogContent-dividers': {
          px: 0
        },
        '& .MuiDialog-paper': {
          width: 'fit-content'
        }
      }}
    >
      {!loading &&
      !error &&
      (data?.templateFamilyStatsBreakdown == null ||
        data.templateFamilyStatsBreakdown.length === 0) ? (
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
            {`${t('No template breakdown analytics data available')}`}
          </Typography>
        </Box>
      ) : (
        <TemplateBreakdownAnalyticsTable
          data={data}
          loading={loading}
          error={error}
        />
      )}
    </Dialog>
  )
}
