import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { useEffect, useRef, useState } from 'react'

import { useCampaignDeleteMutation } from '../../../libs/useCampaignDeleteMutation'
import { useCampaignPublishMutation } from '../../../libs/useCampaignPublishMutation'
import { useCampaignUnpublishMutation } from '../../../libs/useCampaignUnpublishMutation'

interface CampaignMutations {
  /** Id of the campaign currently mid-mutation, or null when idle. */
  busyId: string | null
  publish: (id: string) => Promise<boolean>
  unpublish: (id: string) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}

/**
 * Publish / unpublish / delete with shared snackbar + busy-id bookkeeping
 * (same shape as the Collections list's useCollectionMutations).
 */
export function useCampaignMutations(): CampaignMutations {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [busyId, setBusyId] = useState<string | null>(null)
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])
  // Synchronous double-click guard; `busyId` state cannot gate two clicks in
  // the same render snapshot.
  const submittingRef = useRef(false)

  const [campaignPublish] = useCampaignPublishMutation()
  const [campaignUnpublish] = useCampaignUnpublishMutation()
  const [campaignDelete] = useCampaignDeleteMutation()

  function notify(
    message: string,
    variant: 'success' | 'error' | 'info'
  ): void {
    if (!mountedRef.current) return
    enqueueSnackbar(message, { variant, preventDuplicate: true })
  }

  async function run(
    id: string,
    action: () => Promise<boolean>,
    successMessage: string,
    failureMessage: string
  ): Promise<boolean> {
    if (submittingRef.current) {
      notify(t('Please wait for the current action to finish.'), 'info')
      return false
    }
    submittingRef.current = true
    setBusyId(id)
    try {
      const ok = await action()
      if (!ok) {
        notify(failureMessage, 'error')
        return false
      }
      notify(successMessage, 'success')
      return true
    } catch (error) {
      notify(error instanceof Error ? error.message : failureMessage, 'error')
      return false
    } finally {
      submittingRef.current = false
      if (mountedRef.current) setBusyId(null)
    }
  }

  return {
    busyId,
    publish: (id) =>
      run(
        id,
        async () =>
          (await campaignPublish({ variables: { id } })).data
            ?.campaignPublish != null,
        t('Campaign published'),
        t("Couldn't publish campaign")
      ),
    unpublish: (id) =>
      run(
        id,
        async () =>
          (await campaignUnpublish({ variables: { id } })).data
            ?.campaignUnpublish != null,
        t('Campaign unpublished'),
        t("Couldn't unpublish campaign")
      ),
    remove: (id) =>
      run(
        id,
        async () =>
          (await campaignDelete({ variables: { id } })).data?.campaignDelete !=
          null,
        t('Campaign deleted'),
        t("Couldn't delete campaign")
      )
  }
}
