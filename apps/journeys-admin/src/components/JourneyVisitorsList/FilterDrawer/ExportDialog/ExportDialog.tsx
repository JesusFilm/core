import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { useJourneyContactsExport } from '../../../../libs/useJourneyContactsExport'
import { useJourneyEventsExport } from '../../../../libs/useJourneyEventsExport'

import { ContactDataForm } from './ContactDataForm'
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
          ...(startDate && { periodRangeStart: startDate.toISOString() }),
          ...(endDate && { periodRangeEnd: endDate.toISOString() })
        }
        await exportJourneyContacts({
          journeyId,
          filter,
          contactDataFields: contactData
        })
      }
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
        <Button
          variant="contained"
          color="secondary"
          onClick={handleExport}
          loading={eventsDownloading || contactsDownloading}
          disabled={
            (exportBy === 'Visitor Actions' && selectedEvents.length === 0) ||
            (exportBy === 'Contact Data' && contactData.length === 0)
          }
          sx={{
            mb: { xs: 0, sm: 3 },
            mr: { xs: 0, sm: 3 }
          }}
        >
          {t('Export (CSV)')}
        </Button>
      }
    >
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <Box
        sx={{
          pt: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ whiteSpace: 'nowrap', minWidth: 'fit-content' }}
        >
          {t('Export By:')}
        </Typography>
        <FormControl fullWidth>
          <Select
            value={exportBy}
            onChange={(e) => setExportBy(e.target.value)}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return t('Select Data')
              }
              return selected
            }}
          >
            <MenuItem value="" disabled hidden>
              {t('Select Data')}
            </MenuItem>
            <MenuItem value="Visitor Actions">{t('Visitor Actions')}</MenuItem>
            <MenuItem value="Contact Data">{t('Contact Data')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {exportBy === 'Visitor Actions' && (
        <Box sx={{ pt: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Select visitor actions:')}
          </Typography>
          <FilterForm setSelectedEvents={setSelectedEvents} />
        </Box>
      )}
      {exportBy === 'Contact Data' && (
        <Box sx={{ pt: 4 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Select contact data:')}
          </Typography>
          <ContactDataForm setContactData={setContactData} />
        </Box>
      )}
    </Dialog>
  )
}
