import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'
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
import { format } from 'date-fns'
import { Form, Formik, FormikHelpers, FormikValues } from 'formik'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { KeyboardEvent, ReactElement, useEffect, useState } from 'react'
import { object, string } from 'yup'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

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
  query IntegrationGooglePickerToken($teamId: ID!, $integrationId: ID) {
    integrationGooglePickerToken(teamId: $teamId, integrationId: $integrationId)
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
    $filter: JourneyEventsFilter
    $select: JourneyVisitorExportSelect
    $destination: JourneyVisitorGoogleSheetDestinationInput!
    $integrationId: ID!
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

const DELETE_GOOGLE_SHEETS_SYNC = gql`
  mutation GoogleSheetsSyncDialogDelete($id: ID!) {
    googleSheetsSyncDelete(id: $id) {
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

  const { data: journeyData } = useQuery(GET_JOURNEY_CREATED_AT, {
    variables: { id: journeyId }
  })
  const { data: integrationsData } = useIntegrationQuery({
    teamId: journeyData?.journey?.team?.id as string
  })

  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)

  const [exportToSheets, { loading: sheetsLoading }] =
    useMutation(EXPORT_TO_SHEETS)
  const [getPickerToken] = useLazyQuery(GET_GOOGLE_PICKER_TOKEN)
  const [loadSyncs, { data: syncsData, loading: syncsLoading }] = useLazyQuery<
    GoogleSheetsSyncsQueryData,
    GoogleSheetsSyncsQueryVariables
  >(GET_GOOGLE_SHEETS_SYNCS)
  const [deleteSync] = useMutation(DELETE_GOOGLE_SHEETS_SYNC)

  const [deletingSyncId, setDeletingSyncId] = useState<string | null>(null)
  const [syncIdPendingDelete, setSyncIdPendingDelete] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!open) return
    void loadSyncs({
      variables: { filter: { journeyId } },
      fetchPolicy: 'network-only'
    })
  }, [open, journeyId, loadSyncs])

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
    const shouldReopenGoogleDialog = googleDialogOpen

    try {
      if (shouldReopenGoogleDialog) {
        setGoogleDialogOpen(false)
      }

      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      if (apiKey == null || apiKey === '') {
        enqueueSnackbar(t('Missing Google API key'), { variant: 'error' })
        if (shouldReopenGoogleDialog) setGoogleDialogOpen(true)
        return
      }
      if (integrationId == null || integrationId === '') {
        enqueueSnackbar(t('Select an integration account first'), {
          variant: 'error'
        })
        if (shouldReopenGoogleDialog) setGoogleDialogOpen(true)
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
        if (shouldReopenGoogleDialog) setGoogleDialogOpen(true)
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
                setFieldValue('existingSpreadsheetId', doc.id)
              } else {
                setFieldValue('folderId', doc.id)
                const docName = doc?.name ?? doc?.title ?? doc?.id ?? null
                setFieldValue('folderName', docName ?? undefined)
              }
            }
          }

          if (
            pickerData?.action === googleAny.picker.Action.PICKED ||
            pickerData?.action === googleAny.picker.Action.CANCEL
          ) {
            if (shouldReopenGoogleDialog) setGoogleDialogOpen(true)
          }
        })
        .build()

      picker.setVisible(true)
      elevatePickerZIndexWithRetries()
    } catch (err) {
      enqueueSnackbar(t('Failed to open Google Picker'), { variant: 'error' })
      if (shouldReopenGoogleDialog) setGoogleDialogOpen(true)
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
      const { data } = await exportToSheets({
        variables: {
          journeyId,
          destination,
          integrationId: values.integrationId
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

  const isGoogleActionDisabled = integrationsData == null

  const validationSchema = object().shape({
    integrationId: string().required(t('Integration account is required')),
    sheetName: string().required(t('Sheet tab name is required')),
    spreadsheetTitle: string().when('googleMode', {
      is: 'create',
      then: (schema) =>
        schema.required(
          journeyData?.journey?.title
            ? t('Sheet name is required')
            : t('Sheet name is required')
        ),
      otherwise: (schema) => schema.notRequired()
    })
  })

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
          ) : activeSyncs.length === 0 ? (
            <Typography variant="body2">
              {t(
                'There are no active Google Sheet syncs. Add a new sync to start syncing your data.'
              )}
            </Typography>
          ) : (
            <TableContainer sx={{ maxHeight: 320 }}>
              <Table stickyHeader size="small" aria-label={t('Existing syncs')}>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('Sheet ID')}</TableCell>
                    <TableCell>{t('Tab Name')}</TableCell>
                    <TableCell sx={{ width: 120 }}>{t('Sync Start')}</TableCell>
                    <TableCell>{t('Started By')}</TableCell>
                    <TableCell sx={{ width: 120 }}>{t('Status')}</TableCell>
                    <TableCell sx={{ width: 80 }} align="right">
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
                        <TableCell>
                          <Tooltip
                            title={sync.sheetName ?? ''}
                            arrow
                            placement="top"
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {sync.sheetName ?? 'N/A'}
                            </Typography>
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
                        <TableCell sx={{ width: 80 }} align="right">
                          <IconButton
                            aria-label={t('Delete sync')}
                            color="error"
                            size="small"
                            disabled={isDeleting}
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
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">{t('History')}</Typography>
            {historySyncs.length === 0 ? (
              <Typography variant="body2">
                {t('No removed syncs yet.')}
              </Typography>
            ) : (
              <TableContainer sx={{ maxHeight: 240 }}>
                <Table
                  stickyHeader
                  size="small"
                  aria-label={t('Removed syncs')}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Sheet ID')}</TableCell>
                      <TableCell>{t('Tab Name')}</TableCell>
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
                          <TableCell>
                            <Tooltip
                              title={sync.sheetName ?? ''}
                              arrow
                              placement="top"
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  maxWidth: 200,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {sync.sheetName ?? 'N/A'}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ width: 120 }}>{removedAt}</TableCell>
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
        </Box>
      </Dialog>

      <Formik
        initialValues={{
          integrationId: '',
          googleMode: 'create' as 'create' | 'existing',
          spreadsheetTitle: '',
          sheetName: '',
          folderId: undefined as string | undefined,
          folderName: undefined as string | undefined,
          existingSpreadsheetId: undefined as string | undefined
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
          isValid,
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
              title: t('Add Google Sheets Sync'),
              closeButton: true
            }}
            divider={false}
            dialogActionChildren={
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
              >
                {t('Start Sync')}
              </Button>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl
                  fullWidth
                  error={
                    errors.integrationId != null &&
                    touched.integrationId != null
                  }
                >
                  <Typography variant="subtitle2">
                    {t('Integration Account')}
                  </Typography>
                  <Select
                    name="integrationId"
                    value={values.integrationId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    displayEmpty
                    inputProps={{ 'aria-label': t('Integration account') }}
                    IconComponent={ChevronDown}
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
                        sx={{ mt: 0.5, ml: 1.75 }}
                      >
                        {errors.integrationId as string}
                      </Typography>
                    )}
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
                    name="googleMode"
                    value={values.googleMode}
                    onChange={handleChange}
                    IconComponent={ChevronDown}
                    inputProps={{ 'aria-label': t('Destination') }}
                  >
                    <MenuItem value="create">
                      {t('Create new spreadsheet')}
                    </MenuItem>
                    <MenuItem value="existing">
                      {t('Use existing spreadsheet')}
                    </MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {values.googleMode === 'create' && (
                    <>
                      <Typography variant="subtitle2">
                        {t('Sheet Name')}
                      </Typography>
                      <TextField
                        name="spreadsheetTitle"
                        value={values.spreadsheetTitle}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={t('Enter Sheet title')}
                        inputProps={{ 'aria-label': t('Sheet title') }}
                        size="small"
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
                    </>
                  )}
                  <Typography variant="subtitle2">
                    {t('Sheet Tab Name')}
                  </Typography>
                  <TextField
                    name="sheetName"
                    value={values.sheetName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t('Enter Sheet tab name')}
                    inputProps={{ 'aria-label': t('Sheet tab name') }}
                    size="small"
                    required
                    error={
                      errors.sheetName != null && touched.sheetName != null
                    }
                    helperText={
                      touched.sheetName != null && errors.sheetName != null
                        ? (errors.sheetName as string)
                        : undefined
                    }
                  />
                  {values.googleMode === 'create' ? (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenDrivePicker(
                          'folder',
                          values.integrationId || undefined,
                          setFieldValue
                        )
                      }
                    >
                      {values.folderId
                        ? (values.folderName ?? values.folderId)
                        : t('Choose Folder (optional)')}
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleOpenDrivePicker(
                          'sheet',
                          values.integrationId || undefined,
                          setFieldValue
                        )
                      }
                    >
                      {values.existingSpreadsheetId
                        ? t('Spreadsheet selected')
                        : t('Choose Spreadsheet')}
                    </Button>
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
