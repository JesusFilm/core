import { useMutation, useQuery } from '@apollo/client'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { FormikHelpers } from 'formik'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'
import Plus2Icon from '@core/shared/ui/icons/Plus2'

import { useIntegrationQuery } from '../../../../libs/useIntegrationQuery/useIntegrationQuery'

import { AddSyncFormDialog } from './AddSyncFormDialog'
import { DeleteSyncDialog } from './DeleteSyncDialog'
import {
  EXPORT_TO_SHEETS,
  GET_JOURNEY_CREATED_AT,
  INTEGRATION_GOOGLE_CREATE
} from './graphql'
import { MobileSyncCard } from './MobileSyncCard'
import { SyncTable } from './SyncTable'
import { SyncFormValues } from './types'
import { useGooglePicker } from './libs/useGooglePicker'
import { useGoogleSheetsSync } from './libs/useGoogleSheetsSync'

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
  const user = useUser()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const { data: journeyData } = useQuery(GET_JOURNEY_CREATED_AT, {
    variables: { id: journeyId }
  })
  const { data: integrationsData, refetch: refetchIntegrations } =
    useIntegrationQuery({
      teamId: journeyData?.journey?.team?.id as string
    })

  const [googleDialogOpen, setGoogleDialogOpen] = useState(false)

  const [exportToSheets, { loading: sheetsLoading }] =
    useMutation(EXPORT_TO_SHEETS)

  const teamId = journeyData?.journey?.team?.id as string | undefined

  const { pickerActive, handleOpenDrivePicker } = useGooglePicker({ teamId })

  const {
    loadSyncs,
    syncsLoading,
    syncsCalled,
    activeSyncs,
    historySyncs,
    syncsResolved,
    hasNoSyncs,
    deletingSyncId,
    syncIdPendingDelete,
    setSyncIdPendingDelete,
    backfillingSyncId,
    handleDeleteSync,
    handleRequestDeleteSync,
    handleBackfillSync
  } = useGoogleSheetsSync({ journeyId, open })

  const [integrationGoogleCreate] = useMutation(INTEGRATION_GOOGLE_CREATE)

  const hideMainDialog = !syncsResolved || hasNoSyncs
  const isGoogleActionDisabled = integrationsData == null

  async function handleIntegrationCreate(authCode: string): Promise<void> {
    if (teamId == null || typeof window === 'undefined') return

    const redirectUri = `${window.location.origin}/api/integrations/google/callback`

    const newQuery = { ...router.query }
    delete newQuery.code
    delete newQuery.openSyncDialog
    void router.replace(
      { pathname: router.pathname, query: newQuery },
      undefined,
      { shallow: true }
    )

    try {
      const { data } = await integrationGoogleCreate({
        variables: {
          input: { teamId, code: authCode, redirectUri }
        }
      })

      if (data?.integrationGoogleCreate?.id != null) {
        await refetchIntegrations()
        enqueueSnackbar(t('Google integration created successfully'), {
          variant: 'success'
        })
        setGoogleDialogOpen(true)
      } else {
        enqueueSnackbar(
          t('Google settings failed. Reload the page or try again.'),
          { variant: 'error' }
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  }

  // Load syncs and handle OAuth return
  useEffect(() => {
    if (!open) return
    void loadSyncs({
      variables: { filter: { journeyId } },
      fetchPolicy: 'network-only'
    })

    const openSyncDialog = router.query.openSyncDialog === 'true'

    const authCode = router.query.code as string | undefined
    if (authCode != null && openSyncDialog) {
      if (user.clientInitialized) {
        void handleIntegrationCreate(authCode)
      }
      return
    }

    const integrationCreated = router.query.integrationCreated === 'true'
    if (integrationCreated && openSyncDialog) {
      const newQuery = { ...router.query }
      delete newQuery.integrationCreated
      delete newQuery.openSyncDialog
      void router.replace(
        { pathname: router.pathname, query: newQuery },
        undefined,
        { shallow: true }
      )
      setGoogleDialogOpen(true)
      enqueueSnackbar(t('Google integration created successfully'), {
        variant: 'success'
      })
    }
  }, [
    open,
    journeyId,
    loadSyncs,
    router,
    enqueueSnackbar,
    t,
    user.clientInitialized
  ])

  // Auto-open add dialog when no syncs exist
  useEffect(() => {
    if (!open) return
    if (!syncsCalled) return
    if (syncsLoading) return
    const integrationCreated = router.query.integrationCreated === 'true'
    const hasAuthCode = router.query.code != null
    if (integrationCreated || hasAuthCode) return

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

  async function handleExportToSheets(
    values: SyncFormValues,
    actions: FormikHelpers<SyncFormValues>
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
      if (hideMainDialog) onClose()
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

  function handleCloseAddDialog(): void {
    setGoogleDialogOpen(false)
    if (hideMainDialog) onClose()
  }

  return (
    <>
      <Dialog
        open={open && !hideMainDialog}
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
                    <MobileSyncCard
                      key={sync.id}
                      sync={sync}
                      deletingSyncId={deletingSyncId}
                      backfillingSyncId={backfillingSyncId}
                      onRequestDelete={handleRequestDeleteSync}
                      onBackfill={handleBackfillSync}
                    />
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
                  <AccordionSummary
                    expandIcon={<ChevronDown />}
                    sx={{ px: 2 }}
                  >
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
                        <MobileSyncCard
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
            <SyncTable
              syncs={activeSyncs}
              variant="active"
              deletingSyncId={deletingSyncId}
              backfillingSyncId={backfillingSyncId}
              onRequestDelete={handleRequestDeleteSync}
              onBackfill={handleBackfillSync}
            />
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">{t('History')}</Typography>
              {historySyncs.length === 0 ? (
                <Typography variant="body2">
                  {t('No removed syncs yet.')}
                </Typography>
              ) : (
                <SyncTable syncs={historySyncs} variant="history" />
              )}
            </Box>
          )}
        </Box>
      </Dialog>

      <AddSyncFormDialog
        open={googleDialogOpen}
        onClose={handleCloseAddDialog}
        pickerActive={pickerActive}
        integrations={integrationsData?.integrations ?? []}
        teamId={teamId}
        journeyTitle={journeyData?.journey?.title}
        sheetsLoading={sheetsLoading}
        onSubmit={handleExportToSheets}
        onOpenDrivePicker={handleOpenDrivePicker}
        routerAsPath={router.asPath}
      />

      <DeleteSyncDialog
        syncIdPendingDelete={syncIdPendingDelete}
        deletingSyncId={deletingSyncId}
        onClose={() => setSyncIdPendingDelete(null)}
        onDelete={(syncId) => {
          void handleDeleteSync(syncId)
        }}
      />
    </>
  )
}
