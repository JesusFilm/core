import { gql, useQuery } from '@apollo/client'
import { formatISO } from 'date-fns'
import { ReactElement, useEffect, useMemo, useState } from 'react'

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
import FormGroup from '@mui/material/FormGroup'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

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
        }
      }}
    >
      <TemplateBreakdownAnalyticsTable
        data={data}
        loading={loading}
        error={error}
      />
    </Dialog>
  )
}
