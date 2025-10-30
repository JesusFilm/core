import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { format } from 'date-fns'

import { useJourneyContactsExport } from '../../../../libs/useJourneyContactsExport'
import { useJourneyEventsExport } from '../../../../libs/useJourneyEventsExport'
import { useIntegrationQuery } from '../../../../libs/useIntegrationQuery/useIntegrationQuery'

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

const GET_GOOGLE_PICKER_TOKEN = gql`
  query IntegrationGooglePickerToken($teamId: ID!, $integrationId: ID) {
    integrationGooglePickerToken(teamId: $teamId, integrationId: $integrationId)
  }
`

const GET_GOOGLE_SHEETS_SYNCS = gql`
  query GoogleSheetsSyncs($journeyId: ID!) {
    googleSheetsSyncs(journeyId: $journeyId) {
      id
      spreadsheetId
      sheetName
      folderId
      appendMode
      journeyId
      teamId
      createdAt
      integration {
        __typename
        id
        ... on IntegrationGoogle {
          accountEmail
        }
      }
    }
  }
`

const DELETE_GOOGLE_SHEETS_SYNC = gql`
  mutation GoogleSheetsSyncDelete($id: ID!) {
    googleSheetsSyncDelete(id: $id) {
      id
    }
  }
`

const EXPORT_TO_SHEETS = gql`
  mutation JourneyVisitorExportToGoogleSheet(
    $journeyId: ID!
    $filter: JourneyEventsFilter
    $select: JourneyVisitorExportSelect
    $destination: JourneyVisitorGoogleSheetDestinationInput!
    $integrationId: ID
  ) {
    journeyVisitorExportToGoogleSheet(
      journeyId: $journeyId
      filter: $filter
      select: $select
      destination: $destination
      integrationId: $integrationId
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

interface GoogleSheetsSyncIntegration {
  __typename: string
  id: string
  accountEmail?: string | null
}

interface GoogleSheetsSyncItem {
  id: string
  spreadsheetId: string | null
  createdAt: string
  integration: GoogleSheetsSyncIntegration | null
}

interface GoogleSheetsSyncsQueryData {
  googleSheetsSyncs: GoogleSheetsSyncItem[]
}

interface GoogleSheetsSyncsQueryVariables {
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
  const { data: integrationsData } = useIntegrationQuery({
    teamId: journeyData?.journey?.team?.id as string
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
  const [syncsDialogOpen, setSyncsDialogOpen] = useState(false)
  const [googleMode, setGoogleMode] = useState<'create' | 'existing'>('create')
  const [integrationId, setIntegrationId] = useState<string | undefined>(
    undefined
  )
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('')
  const [sheetName, setSheetName] = useState('')
  const [folderId, setFolderId] = useState<string | undefined>(undefined)
  const [existingSpreadsheetId, setExistingSpreadsheetId] = useState<
    string | undefined
  >(undefined)

  const [exportToSheets, { loading: sheetsLoading }] =
    useMutation(EXPORT_TO_SHEETS)
  const [getPickerToken] = useLazyQuery(GET_GOOGLE_PICKER_TOKEN)
  const [loadSyncs, { data: syncsData, loading: syncsLoading }] = useLazyQuery<
    GoogleSheetsSyncsQueryData,
    GoogleSheetsSyncsQueryVariables
  >(GET_GOOGLE_SHEETS_SYNCS)
  const [deleteSync] = useMutation(DELETE_GOOGLE_SHEETS_SYNC)
  const [deletingSyncId, setDeletingSyncId] = useState<string | null>(null)

  // Drive Picker integration
  async function handleOpenDrivePicker(
    mode: 'folder' | 'sheet'
  ): Promise<void> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      if (apiKey == null || apiKey === '') {
        enqueueSnackbar(t('Missing Google API key'), { variant: 'error' })
        return
      }
      // Use selected integration token only
      if (integrationId == null || integrationId === '') {
        enqueueSnackbar(t('Select an integration account first'), {
          variant: 'error'
        })
        return
      }
      let oauthToken: string | undefined | null
      const teamId = journeyData?.journey?.team?.id
      if (teamId != null) {
        const { data: tokenData } = await getPickerToken({
          variables: { teamId, integrationId }
        })
        oauthToken = tokenData?.integrationGooglePickerToken
      }
      if (oauthToken == null || oauthToken === '') {
        enqueueSnackbar(t('Unable to authorize Google Picker'), {
          variant: 'error'
        })
        return
      }

      await ensurePickerLoaded()

      const googleAny: any = (window as any).google
      const view =
        mode === 'sheet'
          ? new googleAny.picker.DocsView(googleAny.picker.ViewId.SPREADSHEETS)
          : new googleAny.picker.DocsView()
              .setIncludeFolders(true)
              .setSelectFolderEnabled(true)

      const picker = new googleAny.picker.PickerBuilder()
        .setOAuthToken(oauthToken)
        .setDeveloperKey(apiKey)
        .addView(view)
        .setCallback((pickerData: any) => {
          if (pickerData?.action === googleAny.picker.Action.PICKED) {
            const doc = pickerData.docs?.[0]
            if (doc != null) {
              if (mode === 'sheet') {
                setExistingSpreadsheetId(doc.id)
              } else {
                setFolderId(doc.id)
              }
            }
          }
        })
        .build()

      picker.setVisible(true)
      // Force picker to top-most layer (retry in case DOM attaches late)
      elevatePickerZIndexWithRetries()
    } catch (err) {
      enqueueSnackbar(t('Failed to open Google Picker'), { variant: 'error' })
    }
  }

  // Removed GIS fallback to enforce integration usage

  async function ensurePickerLoaded(): Promise<void> {
    const win = window as any
    if (win.google?.picker != null) return
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.async = true
      script.onload = () => {
        const gapi = (window as any).gapi
        if (gapi?.load != null) {
          gapi.load('picker', { callback: resolve })
        } else {
          resolve()
        }
      }
      script.onerror = () => reject(new Error('Failed to load Google API'))
      document.body.appendChild(script)
    })
  }

  async function ensureGisLoaded(): Promise<void> {
    const win = window as any
    if (win.google?.accounts?.oauth2 != null) return
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () =>
        reject(new Error('Failed to load Google Identity Services'))
      document.body.appendChild(script)
    })
  }

  function elevatePickerZIndex(): void {
    const dialog = document.querySelector<HTMLElement>('.picker-dialog')
    const bg = document.querySelector<HTMLElement>('.picker-dialog-bg')
    const modal = document.querySelector<HTMLElement>('.picker.modal-dialog')
    const z = '2147483647'
    if (dialog != null) dialog.style.zIndex = z
    if (bg != null) bg.style.zIndex = z
    if (modal != null) modal.style.zIndex = z
  }

  function elevatePickerZIndexWithRetries(attempts = 10, delayMs = 50): void {
    elevatePickerZIndex()
    if (attempts <= 1) return
    setTimeout(
      () => elevatePickerZIndexWithRetries(attempts - 1, delayMs),
      delayMs
    )
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

  async function handleDeleteSync(syncId: string): Promise<void> {
    setDeletingSyncId(syncId)
    try {
      await deleteSync({ variables: { id: syncId } })
      await loadSyncs({
        variables: { journeyId },
        fetchPolicy: 'network-only'
      })
      enqueueSnackbar(t('Sync deleted'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: 'error' })
    } finally {
      setDeletingSyncId(null)
    }
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
            destination,
            integrationId
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
            destination,
            integrationId
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
            variant="contained"
            color="secondary"
            onClick={async () => {
              setSyncsDialogOpen(true)
              await loadSyncs({
                variables: { journeyId },
                fetchPolicy: 'network-only'
              })
            }}
            loading={eventsDownloading || contactsDownloading}
            disabled={
              exportBy === '' ||
              (exportBy === 'Visitor Actions' && selectedEvents.length === 0) ||
              (exportBy === 'Contact Data' && contactData.length === 0)
            }
            sx={{ mb: { xs: 0, sm: 3 } }}
          >
            {t('Sync to Google Sheets')}
          </Button>
          <Button
            variant="outlined"
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
      {/* Pre-modal: show existing syncs before opening Google Sheets export modal */}
      <Dialog
        open={syncsDialogOpen}
        onClose={() => setSyncsDialogOpen(false)}
        dialogTitle={{
          title: t('Sync to Google Sheets'),
          closeButton: true
        }}
        divider={false}
        maxWidth="lg"
        dialogActionChildren={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Plus2Icon />}
              onClick={() => {
                setSyncsDialogOpen(false)
                setGoogleDialogOpen(true)
              }}
              disabled={syncsLoading}
            >
              {t('New Sync')}
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {syncsLoading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 4
              }}
            >
              <CircularProgress size={24} aria-label={t('Loading')} />
            </Box>
          )}
          {!syncsLoading &&
            (syncsData?.googleSheetsSyncs?.length ?? 0) === 0 && (
              <Typography variant="body2">
                {t(
                  'There are no active Google Sheet syncs. Add a new sync to start syncing your data.'
                )}
              </Typography>
            )}
          {!syncsLoading && (syncsData?.googleSheetsSyncs?.length ?? 0) > 0 && (
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small" aria-label={t('Existing syncs')}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Sheet ID')}</TableCell>
                    <TableCell>{t('Sync start')}</TableCell>
                    <TableCell>{t('Started by')}</TableCell>
                    <TableCell>{t('Status')}</TableCell>
                    <TableCell align="right">{t('Actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(syncsData?.googleSheetsSyncs ?? []).map(
                    (sync: GoogleSheetsSyncItem) => {
                      if (sync.id == null) return null
                      const createdAtDate =
                        sync.createdAt != null ? new Date(sync.createdAt) : null
                      const formattedDate =
                        createdAtDate != null &&
                        !Number.isNaN(createdAtDate.getTime())
                          ? format(createdAtDate, 'yyyy-MM-dd')
                          : 'N/A'
                      const startedBy =
                        sync.integration?.__typename === 'IntegrationGoogle'
                          ? (sync.integration.accountEmail ?? 'N/A')
                          : 'N/A'
                      const isDeleting = deletingSyncId === sync.id

                      return (
                        <TableRow key={sync.id} hover>
                          <TableCell width="40%">
                            <Tooltip
                              title={sync.spreadsheetId ?? ''}
                              arrow
                              placement="top"
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 240,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {sync.spreadsheetId ?? 'N/A'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>{formattedDate}</TableCell>
                          <TableCell>{startedBy}</TableCell>
                          <TableCell>
                            <Chip
                              label={t('Active')}
                              color="success"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              aria-label={t('Delete sync')}
                              color="error"
                              disabled={isDeleting}
                              onClick={() => handleDeleteSync(sync.id)}
                              size="small"
                            >
                              {isDeleting ? (
                                <CircularProgress
                                  size={18}
                                  color="inherit"
                                  aria-label={t('Deleting sync')}
                                />
                              ) : (
                                <Trash2Icon width={18} height={18} />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    }
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Dialog>

      {/* Existing Google Sheets export dialog */}
      <Dialog
        open={googleDialogOpen}
        onClose={() => setGoogleDialogOpen(false)}
        dialogTitle={{
          title: t('Add Google Sheets Sync'),
          closeButton: true
        }}
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
          {/* Integration selector */}
          <FormControl fullWidth>
            <Typography variant="subtitle2">
              {t('Integration Account')}
            </Typography>
            <Select
              value={integrationId ?? ''}
              onChange={(e) =>
                setIntegrationId(
                  (e.target.value as string) === ''
                    ? undefined
                    : (e.target.value as string)
                )
              }
              displayEmpty
              inputProps={{ 'aria-label': t('Integration account') }}
              IconComponent={ChevronDown}
              renderValue={(selected) => {
                if (selected === '') return t('Select integration account')
                const found = integrationsData?.integrations.find(
                  (integration) => integration.id === selected
                )
                if (found?.__typename === 'IntegrationGoogle') {
                  return found.accountEmail ?? t('Unknown email')
                }
                return t('Unknown integration')
              }}
            >
              <MenuItem value="" disabled>
                {t('Select integration account')}
              </MenuItem>
              {integrationsData?.integrations
                ?.filter(
                  (integration) =>
                    integration.__typename === 'IntegrationGoogle'
                )
                .map((integration) => (
                  <MenuItem key={integration.id} value={integration.id}>
                    {integration.accountEmail ?? t('Unknown email')}
                  </MenuItem>
                ))}
            </Select>
            <Button
              variant="text"
              href={`/teams/${journeyData?.journey?.team?.id}/integrations/new/google`}
              sx={{ alignSelf: 'flex-start', mt: 1 }}
            >
              {t('Add new Google integration')}
            </Button>
          </FormControl>

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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {googleMode === 'create' && (
              <>
                <Typography variant="subtitle2">{t('Sheet Name')}</Typography>
                <TextField
                  value={spreadsheetTitle}
                  onChange={(event) => setSpreadsheetTitle(event.target.value)}
                  placeholder={t('Enter Sheet title')}
                  inputProps={{ 'aria-label': t('Sheet title') }}
                  size="small"
                  required
                />
              </>
            )}
            <Typography variant="subtitle2">{t('Sheet Tab Name')}</Typography>
            <TextField
              value={sheetName}
              onChange={(event) => setSheetName(event.target.value)}
              placeholder={t('Enter Sheet tab name')}
              inputProps={{ 'aria-label': t('Sheet tab name') }}
              size="small"
              required
            />
            {googleMode === 'create' ? (
              <Button
                variant="outlined"
                onClick={() => handleOpenDrivePicker('folder')}
              >
                {folderId ? t('Folder selected') : t('Choose folder')}
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={() => handleOpenDrivePicker('sheet')}
              >
                {existingSpreadsheetId
                  ? t('Spreadsheet selected')
                  : t('Choose spreadsheet')}
              </Button>
            )}
          </Box>
        </Box>
      </Dialog>
    </Dialog>
  )
}
