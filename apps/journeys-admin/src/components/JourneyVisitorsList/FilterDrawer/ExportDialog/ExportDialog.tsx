import { gql, useQuery, useMutation } from '@apollo/client'
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
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

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
      slug
      title
      team {
        id
      }
    }
  }
`

const EXPORT_TO_SHEETS = gql`
  mutation JourneyVisitorExportToGoogleSheet(
    $journeyId: ID!
    $filter: JourneyEventsFilter
    $select: JourneyVisitorExportSelect
    $destination: JourneyVisitorGoogleSheetDestinationInput!
  ) {
    journeyVisitorExportToGoogleSheet(
      journeyId: $journeyId
      filter: $filter
      select: $select
      destination: $destination
    ) {
      spreadsheetId
      spreadsheetUrl
      sheetName
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

  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)
  const [googleMode, setGoogleMode] = useState<'create' | 'existing'>('create')
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('')
  const [sheetName, setSheetName] = useState('')
  const [folderId, setFolderId] = useState<string | undefined>(undefined)
  const [existingSpreadsheetId, setExistingSpreadsheetId] = useState<
    string | undefined
  >(undefined)

  const [exportToSheets, { loading: sheetsLoading }] =
    useMutation(EXPORT_TO_SHEETS)

  // Drive Picker integration placeholder: inject Google Picker and set folderId or existingSpreadsheetId
  function handleOpenDrivePicker(mode: 'folder' | 'sheet'): void {
    // Implement Google Picker load here. For now we rely on environment having Picker and set IDs via callbacks.
    // setFolderId('...') or setExistingSpreadsheetId('...')
  }

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

  async function handleExportToSheets(): Promise<void> {
    const destination =
      googleMode === 'create'
        ? {
            mode: 'create' as const,
            spreadsheetTitle: spreadsheetTitle || journeyData?.journey?.title,
            folderId: folderId,
            sheetName: sheetName
          }
        : {
            mode: 'existing' as const,
            spreadsheetId: existingSpreadsheetId,
            sheetName: sheetName
          }

    try {
      if (exportBy === 'Visitor Actions') {
        await exportToSheets({
          variables: {
            journeyId,
            filter: filterArg,
            destination
          }
        })
      } else if (exportBy === 'Contact Data') {
        await exportToSheets({
          variables: {
            journeyId,
            filter: {
              typenames: contactData.filter(
                (d) => d !== 'name' && d !== 'email' && d !== 'phone'
              ),
              ...(startDate && { periodRangeStart: startDate.toISOString() }),
              ...(endDate && { periodRangeEnd: endDate.toISOString() })
            },
            select: {
              name: contactData.includes('name'),
              email: contactData.includes('email'),
              phone: contactData.includes('phone')
            },
            destination
          }
        })
      }
      setGoogleDialogOpen(false)
      onClose()
      enqueueSnackbar(t('Exported to Google Sheets'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error' })
    }
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setGoogleDialogOpen(true)}
            loading={eventsDownloading || contactsDownloading}
            disabled={
              exportBy === '' ||
              (exportBy === 'Visitor Actions' && selectedEvents.length === 0) ||
              (exportBy === 'Contact Data' && contactData.length === 0)
            }
            sx={{ mb: { xs: 0, sm: 3 } }}
          >
            {t('Export to Google Sheets')}
          </Button>
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
            {t('Export (CSV)')}
          </Button>
        </Box>
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
          pr: 2,
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
            inputProps={{ 'aria-label': t('Export By:') }}
            IconComponent={ChevronDown}
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
          <ContactDataForm
            setSelectedFields={setContactData}
            selectedFields={contactData}
          />
        </Box>
      )}
      {/* Google Sheets Dialog */}
      <Dialog
        open={googleDialogOpen}
        onClose={() => setGoogleDialogOpen(false)}
        dialogTitle={{ title: t('Export to Google Sheets'), closeButton: true }}
        divider={false}
        dialogActionChildren={
          <Button
            variant="contained"
            color="secondary"
            onClick={handleExportToSheets}
            loading={sheetsLoading}
            disabled={
              googleMode === 'create'
                ? spreadsheetTitle === '' &&
                  (journeyData?.journey?.title ?? '') === ''
                : existingSpreadsheetId == null || existingSpreadsheetId === ''
            }
          >
            {t('Export')}
          </Button>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <Select
              value={googleMode}
              onChange={(e) =>
                setGoogleMode(e.target.value as 'create' | 'existing')
              }
              IconComponent={ChevronDown}
              inputProps={{ 'aria-label': t('Destination') }}
            >
              <MenuItem value="create">{t('Create new spreadsheet')}</MenuItem>
              <MenuItem value="existing">
                {t('Use existing spreadsheet')}
              </MenuItem>
            </Select>
          </FormControl>

          {googleMode === 'create' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2">
                {t('Spreadsheet title')}
              </Typography>
              <input
                aria-label={t('Spreadsheet title')}
                value={spreadsheetTitle}
                onChange={(e) => setSpreadsheetTitle(e.target.value)}
              />
              <Typography variant="subtitle2">
                {t('Sheet (tab) name')}
              </Typography>
              <input
                aria-label={t('Sheet name')}
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => handleOpenDrivePicker('folder')}
              >
                {folderId ? t('Folder selected') : t('Choose folder')}
              </Button>
            </Box>
          )}

          {googleMode === 'existing' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2">
                {t('Sheet (tab) name')}
              </Typography>
              <input
                aria-label={t('Sheet name')}
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => handleOpenDrivePicker('sheet')}
              >
                {existingSpreadsheetId
                  ? t('Spreadsheet selected')
                  : t('Choose spreadsheet')}
              </Button>
            </Box>
          )}
        </Box>
      </Dialog>
    </Dialog>
  )
}
