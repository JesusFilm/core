import { gql, useQuery } from '@apollo/client'
import Button from '@mui/material/Button'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { useJourneyContactsExport } from '../../../../libs/useJourneyContactsExport'
import { useJourneyEventsExport } from '../../../../libs/useJourneyEventsExport'

import { ExportSettings } from './ExportSettings'

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

export function ExportDialog({
  open,
  onClose,
  journeyId
}: ExportDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const { exportJourneyEvents, downloading: eventsDownloading } =
    useJourneyEventsExport()
  const { exportJourneyContacts, downloading: contactsDownloading } =
    useJourneyContactsExport()
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
  const [contactData, setContactData] = useState<string[]>([])
  const [exportBy, setExportBy] = useState<string>('')

  useEffect(() => {
    if (journeyData?.journey?.createdAt != null) {
      setStartDate(new Date(journeyData.journey.createdAt))
    }
  }, [journeyData])

  const filterArg = {
    typenames: selectedEvents,
    ...(startDate && { periodRangeStart: startDate.toISOString() }),
    ...(endDate && { periodRangeEnd: endDate.toISOString() })
  }

  const handleExport = async (): Promise<void> => {
    try {
      if (exportBy === 'Visitor Actions') {
        const filter = {
          typenames: selectedEvents,
          ...(startDate && { periodRangeStart: startDate.toISOString() }),
          ...(endDate && { periodRangeEnd: endDate.toISOString() })
        }
        await exportJourneyEvents({ journeyId, filter })
      } else if (exportBy === 'Contact Data') {
        const filter = {
          typenames: contactData.filter(
            (data) => data !== 'name' && data !== 'email' && data !== 'phone'
          ),
          ...(startDate && { periodRangeStart: startDate.toISOString() }),
          ...(endDate && { periodRangeEnd: endDate.toISOString() })
        }
        await exportJourneyContacts({
          journeyId,
          filter,
          select: {
            name: contactData.includes('name'),
            email: contactData.includes('email'),
            phone: contactData.includes('phone')
          }
        })
      }
      onClose()
    } catch (error) {
      enqueueSnackbar((error as Error).message, {
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
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          loading={eventsDownloading || contactsDownloading}
          disabled={
            exportBy === '' ||
            (exportBy === 'Visitor Actions' && selectedEvents.length === 0) ||
            (exportBy === 'Contact Data' && contactData.length === 0)
          }
          sx={{
            mb: { xs: 0, sm: 3 },
            mr: { xs: 0, sm: 3 }
          }}
        >
          {t('Download (CSV)')}
        </Button>
      }
    >
      <ExportSettings
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        exportBy={exportBy}
        onExportByChange={setExportBy}
        setSelectedEvents={setSelectedEvents}
        contactData={contactData}
        setContactData={setContactData}
      />
    </Dialog>
  )
}
