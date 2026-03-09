import { LazyQueryExecFunction, useLazyQuery, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { useEffect, useState } from 'react'

import {
  BACKFILL_GOOGLE_SHEETS_SYNC,
  DELETE_GOOGLE_SHEETS_SYNC,
  GET_GOOGLE_SHEETS_SYNCS
} from '../../graphql'
import {
  GoogleSheetsSyncItem,
  GoogleSheetsSyncsQueryData,
  GoogleSheetsSyncsQueryVariables
} from '../../types'

export interface UseGoogleSheetsSyncParams {
  journeyId: string
  open: boolean
}

export interface UseGoogleSheetsSyncReturn {
  loadSyncs: LazyQueryExecFunction<
    GoogleSheetsSyncsQueryData,
    GoogleSheetsSyncsQueryVariables
  >
  syncsLoading: boolean
  syncsCalled: boolean
  activeSyncs: GoogleSheetsSyncItem[]
  historySyncs: GoogleSheetsSyncItem[]
  syncsResolved: boolean
  hasNoSyncs: boolean
  deletingSyncId: string | null
  syncIdPendingDelete: string | null
  setSyncIdPendingDelete: (id: string | null) => void
  backfillingSyncId: string | null
  handleDeleteSync: (syncId: string) => Promise<void>
  handleRequestDeleteSync: (syncId: string) => void
  handleBackfillSync: (syncId: string) => Promise<void>
}

export function useGoogleSheetsSync({
  journeyId,
  open
}: UseGoogleSheetsSyncParams): UseGoogleSheetsSyncReturn {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

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
    if (open) return
    if (deletingSyncId != null) return
    setSyncIdPendingDelete(null)
  }, [open, deletingSyncId])

  const googleSheetsSyncs = syncsData?.googleSheetsSyncs ?? []
  const activeSyncs = googleSheetsSyncs.filter(
    (sync) => sync.deletedAt == null
  )
  const historySyncs = googleSheetsSyncs.filter(
    (sync) => sync.deletedAt != null
  )
  const syncsResolved = syncsCalled && !syncsLoading
  const hasNoSyncs =
    syncsResolved && activeSyncs.length === 0 && historySyncs.length === 0

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

  return {
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
  }
}
