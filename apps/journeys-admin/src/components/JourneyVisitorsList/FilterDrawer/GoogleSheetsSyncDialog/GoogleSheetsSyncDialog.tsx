import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import FolderIcon from '@mui/icons-material/Folder'
import LaunchIcon from '@mui/icons-material/Launch'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import RefreshIcon from '@mui/icons-material/Refresh'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useTheme } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { format } from 'date-fns'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { KeyboardEvent, ReactElement, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { getGoogleOAuthUrl } from '../../../../libs/googleOAuthUrl'
import { useIntegrationQuery } from '../../../../libs/useIntegrationQuery/useIntegrationQuery'

const GET_JOURNEY_CREATED_AT = gql`
  query GoogleSheetsSyncDialogJourney($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      createdAt
      title
      team {
        id
      }
    }
  }
`

const GET_GOOGLE_PICKER_TOKEN = gql`
  query IntegrationGooglePickerToken($integrationId: ID!) {
    integrationGooglePickerToken(integrationId: $integrationId)
  }
`

const GET_GOOGLE_SHEETS_SYNCS = gql`
  query GoogleSheetsSyncs($filter: GoogleSheetsSyncsFilter!) {
    googleSheetsSyncs(filter: $filter) {
      id
      spreadsheetId
      sheetName
      email
      deletedAt
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

const EXPORT_TO_SHEETS = gql`
  mutation JourneyVisitorExportToGoogleSheet(
    $journeyId: ID!
    $destination: JourneyVisitorGoogleSheetDestinationInput!
    $integrationId: ID!
    $timezone: String
  ) {
    journeyVisitorExportToGoogleSheet(
      journeyId: $journeyId
      destination: $destination
      integrationId: $integrationId
      timezone: $timezone
    ) {
      spreadsheetId
      spreadsheetUrl
      sheetName
    }
  }
`

const DELETE_GOOGLE_SHEETS_SYNC = gql`
  mutation GoogleSheetsSyncDialogDelete($id: ID!) {
    googleSheetsSyncDelete(id: $id) {
      id
    }
  }
`

const BACKFILL_GOOGLE_SHEETS_SYNC = gql`
  mutation GoogleSheetsSyncDialogBackfill($id: ID!) {
    googleSheetsSyncBackfill(id: $id) {
      id
    }
  }
`

interface GoogleSheetsSyncItem {
  id: string
  spreadsheetId: string | null
  sheetName: string | null
  email: string | null
  deletedAt: string | null
  createdAt: string
  integration: {
    __typename: string
    id: string
    accountEmail?: string | null
  } | null
}

interface GoogleSheetsSyncsQueryData {
  googleSheetsSyncs: GoogleSheetsSyncItem[]
}

interface GoogleSheetsSyncsQueryVariables {
  filter: {
    journeyId?: string
    integrationId?: string
  }
}

interface GoogleSheetsSyncDialogProps {
  open: boolean
  onClose: () => void
  journeyId: string
}

export function GoogleSheetsSyncDialog({
  open,
  onClose,
  journeyId
}: GoogleSheetsSyncDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { data: journeyData } = useQuery(GET_JOURNEY_CREATED_AT, {
    variables: { id: journeyId }
  })
  const { data: integrationsData } = useIntegrationQuery({
    teamId: journeyData?.journey?.team?.id as string
  })

  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)
  const [pickerActive, setPickerActive] = useState(false)

  const [exportToSheets, { loading: sheetsLoading }] =
    useMutation(EXPORT_TO_SHEETS)
  const [getPickerToken] = useLazyQuery(GET_GOOGLE_PICKER_TOKEN)
  const [
    loadSyncs,
    { data: syncsData, loading: syncsLoading, called: syncsCalled }
  ] = useLazyQuery<GoogleSheetsSyncsQueryData, GoogleSheetsSyncsQueryVariables>(
    GET_GOOGLE_SHEETS_SYNCS
  )
  const [deleteSync] = useMutation(DELETE_GOOGLE_SHEETS_SYNC)
  const [backfillSync] = useMutation(BACKFILL_GOOGLE_SHEETS_SYNC)

  const [deletingSyncId, setDeletingSyncId] = useState<string | null>(null)
  const [syncIdPendingDelete, setSyncIdPendingDelete] = useState<string | null>(
    null
  )
  const [backfillingSyncId, setBackfillingSyncId] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!open) return
    void loadSyncs({
      variables: { filter: { journeyId } },
      fetchPolicy: 'network-only'
    })

    // Check if returning from Google integration creation
    const integrationCreated = router.query.integrationCreated === 'true'
    const openSyncDialog = router.query.openSyncDialog === 'true'

    if (integrationCreated && openSyncDialog) {
      // Remove query parameters from URL
      const newQuery = { ...router.query }
      delete newQuery.integrationCreated
      delete newQuery.openSyncDialog
      void router.replace(
        {
          pathname: router.pathname,
          query: newQuery
        },
        undefined,
        { shallow: true }
      )

      // Open the "Add Google Sheets Sync" dialog
      setGoogleDialogOpen(true)
      enqueueSnackbar(t('Google integration created successfully'), {
        variant: 'success'
      })
    }
  }, [open, journeyId, loadSyncs, router, enqueueSnackbar, t])

  useEffect(() => {
    if (open) return
    if (deletingSyncId != null) return
    setSyncIdPendingDelete(null)
  }, [open, deletingSyncId])

  const googleSheetsSyncs = syncsData?.googleSheetsSyncs ?? []
  const activeSyncs = googleSheetsSyncs.filter((sync) => sync.deletedAt == null)
  const historySyncs = googleSheetsSyncs.filter(
    (sync) => sync.deletedAt != null
  )

  // Auto-open "Add Google Sheets Sync" dialog if there are no syncs
  useEffect(() => {
    if (!open) return
    // Wait until the query has actually been executed at least once
    if (!syncsCalled) return
    if (syncsLoading) return
    // Skip if we're already handling integration creation return flow
    const integrationCreated = router.query.integrationCreated === 'true'
    if (integrationCreated) return

    // If there are no active or history syncs, open the add dialog directly
    if (activeSyncs.length === 0 && historySyncs.length === 0) {
      setGoogleDialogOpen(true)
    }
  }, [
    open,
    syncsCalled,
    syncsLoading,
    activeSyncs.length,
    historySyncs.length,
    router.query.integrationCreated
  ])

  function getStartedByLabel(sync: GoogleSheetsSyncItem): string {
    if (sync.integration?.__typename === 'IntegrationGoogle') {
      return sync.integration.accountEmail ?? sync.email ?? 'N/A'
    }

    if (sync.email != null && sync.email !== '') return sync.email

    return 'N/A'
  }

  function getSpreadsheetUrl(sync: GoogleSheetsSyncItem): string | null {
    if (sync.spreadsheetId == null || sync.spreadsheetId === '') return null
    return `https://docs.google.com/spreadsheets/d/${sync.spreadsheetId}`
  }

  function handleOpenSyncRow(sync: GoogleSheetsSyncItem): void {
    const spreadsheetUrl = getSpreadsheetUrl(sync)
    if (spreadsheetUrl == null) {
      enqueueSnackbar(t('Something went wrong, please try again!'), {
        variant: 'error'
      })
      return
    }

    if (typeof window === 'undefined') return

    window.open(spreadsheetUrl, '_blank', 'noopener,noreferrer')
  }

  function handleSyncRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    sync: GoogleSheetsSyncItem
  ): void {
    if (event.key === 'Enter') {
      handleOpenSyncRow(sync)
      return
    }

    if (event.key === ' ') {
      event.preventDefault()
      handleOpenSyncRow(sync)
    }
  }

  async function handleOpenDrivePicker(
    mode: 'folder' | 'sheet',
    integrationId: string | undefined,
    setFieldValue: (field: string, value: unknown) => void
  ): Promise<void> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      if (apiKey == null || apiKey === '') {
        enqueueSnackbar(t('Missing Google API key'), { variant: 'error' })
        return
      }
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

      // Mark picker as active to lower dialog z-index
      setPickerActive(true)

      const googleAny: any = (window as any).google
      const view =
        mode === 'sheet'
          ? new googleAny.picker.DocsView(googleAny.picker.ViewId.SPREADSHEETS)
          : new googleAny.picker.DocsView(
              googleAny.picker.ViewId.FOLDERS
            ).setSelectFolderEnabled(true)

      const picker = new googleAny.picker.PickerBuilder()
        .setOAuthToken(oauthToken)
        .setDeveloperKey(apiKey)
        .addView(view)
        .setCallback((pickerData: any) => {
          if (pickerData?.action === googleAny.picker.Action.PICKED) {
            const doc = pickerData.docs?.[0]
            if (doc != null) {
              const docName = doc?.name ?? doc?.title ?? doc?.id ?? null
              if (mode === 'sheet') {
                setFieldValue('existingSpreadsheetId', doc.id)
                setFieldValue('existingSpreadsheetName', docName ?? undefined)
              } else {
                setFieldValue('folderId', doc.id)
                setFieldValue('folderName', docName ?? undefined)
              }
            }
          }

          if (
            pickerData?.action === googleAny.picker.Action.PICKED ||
            pickerData?.action === googleAny.picker.Action.CANCEL
          ) {
            setPickerActive(false)
          }
        })
        .build()

      picker.setVisible(true)
      elevatePickerZIndexWithRetries()
    } catch (err) {
      enqueueSnackbar(t('Failed to open Google Picker'), { variant: 'error' })
      setPickerActive(false)
    }
  }

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

  function elevatePickerZIndex(): void {
    const pickerElements = document.querySelectorAll<HTMLElement>(
      '.picker-dialog, .picker-dialog-bg, .picker.modal-dialog, [class*="picker"]'
    )

    if (pickerElements.length === 0) return

    // Ensure the Google Picker is always above any MUI dialog or overlay.
    // Use a very high static value to stay above custom MUI z-index configurations.
    const pickerZIndex = '99999'

    pickerElements.forEach((element) => {
      element.style.zIndex = pickerZIndex
    })
  }

  function elevatePickerZIndexWithRetries(attempts = 100, delayMs = 100): void {
    elevatePickerZIndex()
    if (attempts <= 1) return
    setTimeout(
      () => elevatePickerZIndexWithRetries(attempts - 1, delayMs),
      delayMs
    )
  }

  async function handleExportToSheets(
    values: FormikValues,
    actions: FormikHelpers<FormikValues>
  ): Promise<void> {
    const destination =
      values.googleMode === 'create'
        ? {
            mode: 'create' as const,
            spreadsheetTitle:
              values.spreadsheetTitle || journeyData?.journey?.title,
            folderId: values.folderId,
            sheetName: values.sheetName
          }
        : {
            mode: 'existing' as const,
            spreadsheetId: values.existingSpreadsheetId,
            sheetName: values.sheetName
          }

    try {
      // Get user's timezone to store with sync for consistent date formatting
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      const { data } = await exportToSheets({
        variables: {
          journeyId,
          destination,
          integrationId: values.integrationId,
          timezone: userTimezone
        }
      })

      const syncResult = data?.journeyVisitorExportToGoogleSheet
      const spreadsheetUrl =
        syncResult?.spreadsheetUrl ??
        (syncResult?.spreadsheetId != null && syncResult.spreadsheetId !== ''
          ? `https://docs.google.com/spreadsheets/d/${syncResult.spreadsheetId}`
          : null)
      setGoogleDialogOpen(false)
      actions.resetForm()
      if (typeof window !== 'undefined' && spreadsheetUrl != null) {
        window.open(spreadsheetUrl, '_blank', 'noopener,noreferrer')
      }
      enqueueSnackbar(t('Sync created'), { variant: 'success' })
      await loadSyncs({
        variables: { filter: { journeyId } },
        fetchPolicy: 'network-only'
      })
      onClose()
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: 'error' })
    }
  }

  async function handleDeleteSync(syncId: string): Promise<void> {
    setDeletingSyncId(syncId)
    try {
      await deleteSync({
        variables: { id: syncId },
        refetchQueries: [
          {
            query: GET_GOOGLE_SHEETS_SYNCS,
            variables: { filter: { journeyId } }
          }
        ],
        awaitRefetchQueries: true
      })
      enqueueSnackbar(t('Sync removed'), { variant: 'success' })
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: 'error' })
    } finally {
      setDeletingSyncId(null)
      setSyncIdPendingDelete(null)
    }
  }

  function handleRequestDeleteSync(syncId: string): void {
    setSyncIdPendingDelete(syncId)
  }

  async function handleBackfillSync(syncId: string): Promise<void> {
    setBackfillingSyncId(syncId)
    try {
      await backfillSync({
        variables: { id: syncId }
      })
      enqueueSnackbar(
        t('Backfill started. Your sheet will be updated shortly.'),
        { variant: 'success' }
      )
    } catch (error) {
      enqueueSnackbar((error as Error).message, { variant: 'error' })
    } finally {
      setBackfillingSyncId(null)
    }
  }

  const isGoogleActionDisabled = integrationsData == null

  const validationSchema = object().shape({
    integrationId: string().required(t('Integration account is required')),
    sheetName: string().required(t('Sheet tab name is required')),
    spreadsheetTitle: string().when(
      'googleMode',
      (googleMode: unknown, schema) =>
        googleMode === 'create'
          ? schema.required(t('Sheet name is required'))
          : schema.notRequired()
    )
  })

  const RenderMobileSyncCard = ({
    sync,
    isHistory = false
  }: {
    sync: GoogleSheetsSyncItem
    isHistory?: boolean
  }): ReactElement => {
    const spreadsheetUrl = getSpreadsheetUrl(sync)
    const createdAtDate = new Date(sync.createdAt)
    const formattedDate = !Number.isNaN(createdAtDate.getTime())
      ? format(createdAtDate, 'yyyy-MM-dd')
      : 'N/A'
    const startedBy = getStartedByLabel(sync)
    const isDeleting = deletingSyncId === sync.id

    return (
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Link
            href={spreadsheetUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecorationColor: 'text.primary'
            }}
            onClick={(e) => {
              if (spreadsheetUrl == null) e.preventDefault()
            }}
          >
            {sync.sheetName ?? sync.spreadsheetId ?? t('Not found')}
            <LaunchIcon sx={{ fontSize: 16 }} />
          </Link>
        </Box>

        <Box>
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 700 }}>
              {t('Sync Start:')}{' '}
            </Box>
            {formattedDate}
          </Typography>
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 700 }}>
              {t('By:')}{' '}
            </Box>
            {startedBy}
          </Typography>
        </Box>

        {!isHistory && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 1
            }}
          >
            <Chip
              label={t('Active')}
              size="small"
              sx={{
                bgcolor: 'rgba(89,195,5,0.2)',
                color: '#38893c',
                fontWeight: 600
              }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip
                title={t('Backfill - Replace all data with fresh export')}
              >
                <IconButton
                  onClick={() => handleBackfillSync(sync.id)}
                  disabled={backfillingSyncId === sync.id || isDeleting}
                  size="small"
                  aria-label={t('Backfill sync')}
                >
                  {backfillingSyncId === sync.id ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={() => handleRequestDeleteSync(sync.id)}
                disabled={isDeleting || backfillingSyncId === sync.id}
                size="small"
              >
                {isDeleting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Trash2Icon />
                )}
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        dialogTitle={{
          title: t('Sync to Google Sheets'),
          closeButton: true
        }}
        divider={false}
        maxWidth="lg"
        dialogActionChildren={
          !isMobile ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Plus2Icon />}
              onClick={() => {
                setGoogleDialogOpen(true)
              }}
              disabled={isGoogleActionDisabled || syncsLoading}
            >
              {t('New Sync')}
            </Button>
          ) : undefined
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {syncsLoading ? (
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
          ) : isMobile ? (
            <Box sx={{ mx: -3, my: -2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {activeSyncs.length === 0 ? (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2">
                      {t(
                        'There are no active Google Sheet syncs. Add a new sync to start syncing your data.'
                      )}
                    </Typography>
                  </Box>
                ) : (
                  activeSyncs.map((sync) => (
                    <RenderMobileSyncCard key={sync.id} sync={sync} />
                  ))
                )}
              </Box>

              <Box sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Plus2Icon />}
                  onClick={() => setGoogleDialogOpen(true)}
                  disabled={isGoogleActionDisabled}
                  sx={{
                    bgcolor: '#26262e',
                    color: 'white',
                    '&:hover': { bgcolor: '#1a1a1f' }
                  }}
                >
                  {t('New Sync')}
                </Button>
              </Box>

              <Box>
                <Accordion
                  disableGutters
                  elevation={0}
                  sx={{ '&:before': { display: 'none' } }}
                  defaultExpanded
                >
                  <AccordionSummary expandIcon={<ChevronDown />} sx={{ px: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('Sync History')}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0 }}>
                    {historySyncs.length === 0 ? (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2">
                          {t('No removed syncs yet.')}
                        </Typography>
                      </Box>
                    ) : (
                      historySyncs.map((sync) => (
                        <RenderMobileSyncCard
                          key={sync.id}
                          sync={sync}
                          isHistory
                        />
                      ))
                    )}
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Box>
          ) : activeSyncs.length === 0 ? (
            <Typography variant="body2">
              {t(
                'There are no active Google Sheet syncs. Add a new sync to start syncing your data.'
              )}
            </Typography>
          ) : (
            <TableContainer
              sx={{
                maxHeight: 320,
                overflowY: 'auto',
                overflowX: 'auto'
              }}
            >
              <Table stickyHeader size="small" aria-label={t('Existing syncs')}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Sheet Name')}</TableCell>
                    <TableCell sx={{ width: 120 }}>{t('Sync Start')}</TableCell>
                    <TableCell>{t('Started By')}</TableCell>
                    <TableCell sx={{ width: 120 }}>{t('Status')}</TableCell>
                    <TableCell sx={{ width: 100 }} align="right">
                      {t('Actions')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeSyncs.map((sync) => {
                    const createdAtDate = new Date(sync.createdAt)
                    const formattedDate = !Number.isNaN(createdAtDate.getTime())
                      ? format(createdAtDate, 'yyyy-MM-dd')
                      : 'N/A'
                    const startedBy = getStartedByLabel(sync)
                    const isDeleting = deletingSyncId === sync.id

                    return (
                      <TableRow
                        key={sync.id}
                        hover
                        role="button"
                        tabIndex={0}
                        aria-label={`${t('Open link in new tab')}: ${
                          sync.sheetName ?? sync.spreadsheetId ?? t('Not found')
                        }`}
                        onClick={() => handleOpenSyncRow(sync)}
                        onKeyDown={(event) => handleSyncRowKeyDown(event, sync)}
                        sx={{
                          cursor: 'pointer',
                          '&:focus-visible': {
                            outline: (theme) =>
                              `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: 2
                          }
                        }}
                      >
                        <TableCell width="40%">
                          <Tooltip
                            title={sync.sheetName ?? ''}
                            arrow
                            placement="top"
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                maxWidth: 240
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  textDecoration: 'underline'
                                }}
                              >
                                {sync.sheetName ?? 'N/A'}
                              </Typography>
                              <NorthEastIcon
                                sx={{ fontSize: 14, flexShrink: 0 }}
                              />
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ width: 120 }}>
                          {formattedDate}
                        </TableCell>
                        <TableCell>{startedBy}</TableCell>
                        <TableCell sx={{ width: 120 }}>
                          <Chip
                            label={t('Active')}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ width: 100 }} align="right">
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.5,
                              justifyContent: 'flex-end'
                            }}
                          >
                            <Tooltip
                              title={t(
                                'Backfill - Replace all data with fresh export'
                              )}
                            >
                              <IconButton
                                aria-label={t('Backfill sync')}
                                color="primary"
                                size="small"
                                disabled={
                                  backfillingSyncId === sync.id || isDeleting
                                }
                                onClick={(event) => {
                                  event.stopPropagation()
                                  void handleBackfillSync(sync.id)
                                }}
                              >
                                {backfillingSyncId === sync.id ? (
                                  <CircularProgress
                                    size={18}
                                    color="inherit"
                                    aria-label={t('Backfilling sync')}
                                  />
                                ) : (
                                  <RefreshIcon sx={{ fontSize: 18 }} />
                                )}
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              aria-label={t('Delete sync')}
                              color="error"
                              size="small"
                              disabled={
                                isDeleting || backfillingSyncId === sync.id
                              }
                              onClick={(event) => {
                                event.stopPropagation()
                                handleRequestDeleteSync(sync.id)
                              }}
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
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{t('History')}</Typography>
              {historySyncs.length === 0 ? (
                <Typography variant="body2">
                  {t('No removed syncs yet.')}
                </Typography>
              ) : (
                <TableContainer
                  sx={{ maxHeight: 240, overflowY: 'auto', overflowX: 'auto' }}
                >
                  <Table
                    stickyHeader
                    size="small"
                    aria-label={t('Removed syncs')}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('Sheet Name')}</TableCell>
                        <TableCell sx={{ width: 120 }}>
                          {t('Removed At')}
                        </TableCell>
                        <TableCell>{t('Started By')}</TableCell>
                        <TableCell sx={{ width: 120 }}>{t('Status')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historySyncs.map((sync) => {
                        const removedAtDate = sync.deletedAt
                          ? new Date(sync.deletedAt)
                          : null
                        const removedAt =
                          removedAtDate != null &&
                          !Number.isNaN(removedAtDate.getTime())
                            ? format(removedAtDate, 'yyyy-MM-dd')
                            : 'N/A'
                        const startedBy = getStartedByLabel(sync)

                        return (
                          <TableRow
                            key={sync.id}
                            hover
                            role="button"
                            tabIndex={0}
                            aria-label={`${t('Open link in new tab')}: ${
                              sync.sheetName ??
                              sync.spreadsheetId ??
                              t('Not found')
                            }`}
                            onClick={() => handleOpenSyncRow(sync)}
                            onKeyDown={(event) =>
                              handleSyncRowKeyDown(event, sync)
                            }
                            sx={{
                              cursor: 'pointer',
                              '&:focus-visible': {
                                outline: (theme) =>
                                  `2px solid ${theme.palette.primary.main}`,
                                outlineOffset: 2
                              }
                            }}
                          >
                            <TableCell width="40%">
                              <Tooltip
                                title={sync.sheetName ?? ''}
                                arrow
                                placement="top"
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    maxWidth: 240
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    {sync.sheetName ?? 'N/A'}
                                  </Typography>
                                  <LaunchIcon
                                    sx={{ fontSize: 14, flexShrink: 0 }}
                                  />
                                </Box>
                              </Tooltip>
                            </TableCell>
                            <TableCell sx={{ width: 120 }}>
                              {removedAt}
                            </TableCell>
                            <TableCell>{startedBy}</TableCell>
                            <TableCell sx={{ width: 120 }}>
                              <Chip label={t('Removed')} size="small" />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      </Dialog>

      <Formik
        initialValues={{
          integrationId: '',
          googleMode: '',
          spreadsheetTitle: '',
          sheetName: '',
          folderId: undefined as string | undefined,
          folderName: undefined as string | undefined,
          existingSpreadsheetId: undefined as string | undefined,
          existingSpreadsheetName: undefined as string | undefined
        }}
        validationSchema={validationSchema}
        onSubmit={handleExportToSheets}
        enableReinitialize
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          errors,
          touched,
          resetForm,
          setFieldValue
        }) => (
          <Dialog
            open={googleDialogOpen}
            onClose={() => {
              setGoogleDialogOpen(false)
              resetForm()
            }}
            dialogTitle={{
              title: t('Sync to Google Sheets'),
              closeButton: true
            }}
            divider={false}
            maxWidth="sm"
            sx={{
              zIndex: pickerActive ? 1 : undefined
            }}
            dialogActionChildren={
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => {
                    setGoogleDialogOpen(false)
                    resetForm()
                  }}
                  sx={{
                    fontSize: '18px',
                    fontWeight: 700,
                    lineHeight: '20px',
                    px: 2,
                    py: '10px'
                  }}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleSubmit()}
                  loading={sheetsLoading}
                  disabled={
                    values.integrationId === '' ||
                    values.sheetName === '' ||
                    (values.googleMode === 'create' &&
                      values.spreadsheetTitle === '' &&
                      (journeyData?.journey?.title ?? '') === '') ||
                    (values.googleMode === 'existing' &&
                      (values.existingSpreadsheetId == null ||
                        values.existingSpreadsheetId === '')) ||
                    (errors.integrationId != null &&
                      touched.integrationId != null) ||
                    (errors.sheetName != null && touched.sheetName != null) ||
                    (values.googleMode === 'create' &&
                      errors.spreadsheetTitle != null &&
                      touched.spreadsheetTitle != null)
                  }
                  sx={{
                    fontSize: '18px',
                    fontWeight: 700,
                    lineHeight: '20px',
                    px: '12px',
                    py: '10px'
                  }}
                >
                  {t('Create Sync')}
                </Button>
              </Box>
            }
          >
            <Form>
              <input
                type="hidden"
                name="folderId"
                value={values.folderId ?? ''}
              />
              <input
                type="hidden"
                name="folderName"
                value={values.folderName ?? ''}
              />
              <input
                type="hidden"
                name="existingSpreadsheetId"
                value={values.existingSpreadsheetId ?? ''}
              />
              <input
                type="hidden"
                name="existingSpreadsheetName"
                value={values.existingSpreadsheetName ?? ''}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl
                  fullWidth
                  error={
                    errors.integrationId != null &&
                    touched.integrationId != null
                  }
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: '18px',
                      fontWeight: 600,
                      lineHeight: '24px',
                      mb: 1
                    }}
                  >
                    {t('Google Account')}
                  </Typography>
                  <Select
                    name="integrationId"
                    value={values.integrationId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    displayEmpty
                    inputProps={{ 'aria-label': t('Integration account') }}
                    IconComponent={ChevronDown}
                    sx={{ mb: 1 }}
                    renderValue={(selected) => {
                      if (selected === '')
                        return t('Select integration account')
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
                  {touched.integrationId != null &&
                    errors.integrationId != null && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 0.5, ml: 2 }}
                      >
                        {errors.integrationId as string}
                      </Typography>
                    )}
                  <Button
                    variant="text"
                    color="primary"
                    href={(() => {
                      const teamId = journeyData?.journey?.team?.id
                      if (teamId == null) return undefined

                      // Create returnTo URL that will redirect back to current page with sync dialog open
                      const currentPath = router.asPath.split('?')[0]
                      const returnTo = `${currentPath}?openSyncDialog=true`

                      // Generate OAuth URL that will redirect to GoogleCreateIntegration page,
                      // which will then redirect back to returnTo after integration is created
                      const googleCreateIntegrationPath = `/teams/${teamId}/integrations/new/google?returnTo=${encodeURIComponent(returnTo)}`
                      return getGoogleOAuthUrl(
                        teamId,
                        googleCreateIntegrationPath
                      )
                    })()}
                    sx={{
                      alignSelf: 'flex-end',
                      fontSize: '14px',
                      fontWeight: 600,
                      lineHeight: '16px',
                      px: 1,
                      py: 0.75
                    }}
                    disabled={journeyData?.journey?.team?.id == null}
                  >
                    {t('Add New Google Account')}
                  </Button>
                </FormControl>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <FormControl fullWidth>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '18px',
                        fontWeight: 600,
                        lineHeight: '24px',
                        mb: 1
                      }}
                    >
                      {t('Spreadsheet Setup')}
                    </Typography>
                    <Select
                      name="googleMode"
                      value={values.googleMode}
                      onChange={handleChange}
                      IconComponent={ChevronDown}
                      inputProps={{ 'aria-label': t('Destination') }}
                      displayEmpty
                      renderValue={(selected) => {
                        if (selected === '') return t('Select an option')
                        if (selected === 'create') return t('Create new sheet')
                        if (selected === 'existing')
                          return t('Use existing spreadsheet')
                        return ''
                      }}
                    >
                      <MenuItem value="" disabled>
                        {t('Select an option')}
                      </MenuItem>
                      <MenuItem value="create">
                        {t('Create new sheet')}
                      </MenuItem>
                      <MenuItem value="existing">
                        {t('Use existing spreadsheet')}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  {values.googleMode !== '' && (
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                    >
                      {values.googleMode === 'create' ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<FolderIcon />}
                            onClick={() =>
                              handleOpenDrivePicker(
                                'folder',
                                values.integrationId || undefined,
                                setFieldValue
                              )
                            }
                            sx={{
                              fontSize: '15px',
                              fontWeight: 600,
                              lineHeight: '18px',
                              justifyContent: 'flex-start',
                              alignSelf: 'flex-start',
                              px: '9px',
                              py: '7px',
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2
                              }
                            }}
                          >
                            {values.folderId
                              ? (values.folderName ?? values.folderId)
                              : t('Choose folder')}
                          </Button>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#444451',
                              ml: 2
                            }}
                          >
                            {t(
                              'Optional: Choose a folder in Google Drive to store your new spreadsheet.'
                            )}
                          </Typography>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              handleOpenDrivePicker(
                                'sheet',
                                values.integrationId || undefined,
                                setFieldValue
                              )
                            }
                            sx={{
                              fontSize: '15px',
                              fontWeight: 600,
                              lineHeight: '18px',
                              justifyContent: 'flex-start',
                              alignSelf: 'flex-start',
                              px: '9px',
                              py: '7px',
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2
                              }
                            }}
                          >
                            {values.existingSpreadsheetId
                              ? (values.existingSpreadsheetName ??
                                values.existingSpreadsheetId)
                              : t('Choose Spreadsheet')}
                          </Button>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '12px',
                              lineHeight: '16px',
                              color: '#444451',
                              ml: 2
                            }}
                          >
                            {t(
                              'Select a spreadsheet from Google Drive to sync your data.'
                            )}
                          </Typography>
                        </Box>
                      )}
                      {values.googleMode === 'create' && (
                        <TextField
                          name="spreadsheetTitle"
                          value={values.spreadsheetTitle}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          label={t('Sheet name')}
                          placeholder={t('Sheet name')}
                          inputProps={{ 'aria-label': t('Sheet title') }}
                          fullWidth
                          required
                          error={
                            errors.spreadsheetTitle != null &&
                            touched.spreadsheetTitle != null
                          }
                          helperText={
                            touched.spreadsheetTitle != null &&
                            errors.spreadsheetTitle != null
                              ? (errors.spreadsheetTitle as string)
                              : undefined
                          }
                        />
                      )}
                      <TextField
                        name="sheetName"
                        value={values.sheetName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label={t('Sheet tab name')}
                        placeholder={t('Sheet tab name')}
                        inputProps={{ 'aria-label': t('Sheet tab name') }}
                        fullWidth
                        required
                        error={
                          errors.sheetName != null && touched.sheetName != null
                        }
                        helperText={
                          touched.sheetName != null && errors.sheetName != null
                            ? (errors.sheetName as string)
                            : t('Data will sync in this tab.')
                        }
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Form>
          </Dialog>
        )}
      </Formik>

      <Dialog
        open={syncIdPendingDelete != null}
        onClose={() => {
          if (deletingSyncId != null) return
          setSyncIdPendingDelete(null)
        }}
        dialogTitle={{
          title: t('Delete Google Sheets Sync'),
          closeButton: true
        }}
        divider={false}
        maxWidth="sm"
        dialogActionChildren={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setSyncIdPendingDelete(null)}
              disabled={deletingSyncId != null}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (syncIdPendingDelete != null) {
                  void handleDeleteSync(syncIdPendingDelete)
                }
              }}
              loading={deletingSyncId != null}
            >
              {t('Delete Sync')}
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1">
            {t(
              "Data will no longer update in your Google Sheet if you delete this sync. Existing data will remain, but new updates won't be sent."
            )}
          </Typography>
          <Typography variant="body1">
            {t('You will have to start a new sync to re-start syncing.')}
          </Typography>
        </Box>
      </Dialog>
    </>
  )
}
