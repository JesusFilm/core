import { gql, useQuery } from '@apollo/client'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { useJourneyEventsExport } from '../../../../libs/useJourneyEventsExport'

import { DateRangePicker } from './DateRangePicker'
import { FilterForm } from './FilterForm'

export const GET_JOURNEY_CREATED_AT = gql`
  query GetJourneyCreatedAt($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      createdAt
    }
  }
`

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  journeyId: string
}

/**
 * Dialog component for exporting journey analytics events
 * @param open - Whether the dialog is visible
 * @param onClose - Callback fired when the dialog is closed
 * @param journeyId - ID of the journey to export events from
 */
export function ExportDialog({
  open,
  onClose,
  journeyId
}: ExportDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { exportJourneyEvents, downloading } = useJourneyEventsExport()
  const { data: journeyData } = useQuery(GET_JOURNEY_CREATED_AT, {
    variables: { id: journeyId }
  })

  const [startDate, setStartDate] = useState<Date | null>(() =>
    journeyData?.journey?.createdAt
      ? new Date(journeyData.journey.createdAt)
      : null
  )
  const [endDate, setEndDate] = useState<Date | null>(new Date())
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  useEffect(() => {
    if (journeyData?.journey?.createdAt != null) {
      setStartDate(new Date(journeyData.journey.createdAt))
    }
  }, [journeyData])

  const handleExport = async (): Promise<void> => {
    try {
      const filter = {
        typenames: selectedEvents,
        ...(startDate && { periodRangeStart: startDate.toISOString() }),
        ...(endDate && { periodRangeEnd: endDate.toISOString() })
      }

      await exportJourneyEvents({ journeyId, filter })
      onClose()
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: t('Export Analytics'),
        closeButton: true
      }}
      divider={false}
      dialogActionChildren={
        <LoadingButton
          loading={downloading}
          variant="contained"
          color="secondary"
          onClick={handleExport}
          disabled={selectedEvents.length === 0}
          sx={{
            mb: { xs: 0, sm: 3 },
            mr: { xs: 0, sm: 3 }
          }}
        >
          {t('Export (CSV)')}
        </LoadingButton>
      }
    >
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <Box sx={{ pt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('Select visitor actions')}
        </Typography>
        <FilterForm setSelectedEvents={setSelectedEvents} />
      </Box>
    </Dialog>
  )
}
