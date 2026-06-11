import { useApolloClient } from '@apollo/client'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { useTemplateGalleryPageAssignJourneyMutation } from '../../../libs/useTemplateGalleryPageAssignJourneyMutation'
import { MenuItem } from '../../MenuItem'
import {
  CopyToCollectionDialog,
  type JourneyLanguage
} from '../CopyToCollectionDialog'

interface TranslationVars {
  journeyId: string
  name: string
  journeyLanguageName: string
  textLanguageId: string
  textLanguageName: string
  userLanguageId?: string
  userLanguageName?: string
}

export interface CopyToCollectionMenuItemProps {
  id?: string
  journey?: Journey
  handleCloseMenu: () => void
  setHasOpenDialog?: (open: boolean) => void
  handleKeepMounted?: () => void
}

/**
 * CopyToCollectionMenuItem
 *
 * Renders the "Copy to collection..." menu item and orchestrates the
 * three-step pipeline (journeyDuplicate → optional translation
 * subscription → templateGalleryPageAssignJourney), with a
 * `GetAdminJourneys` refetch after assign success/failure and after
 * translation failure. Surfaces in-progress and error states into
 * `CopyToCollectionDialog` via `loading` and `errorMessage`; success
 * closes the dialog and confirms with an auto-dismissing snackbar.
 */
export function CopyToCollectionMenuItem({
  id,
  journey,
  handleCloseMenu,
  setHasOpenDialog,
  handleKeepMounted
}: CopyToCollectionMenuItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { activeTeam } = useTeam()
  const client = useApolloClient()
  const { enqueueSnackbar } = useSnackbar()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [translationVariables, setTranslationVariables] =
    useState<TranslationVars | null>(null)

  // Refs read by subscription callbacks (Formik may be torn down by the
  // time the subscription's onComplete/onError fires).
  const mountedRef = useRef(false)
  const newJourneyIdRef = useRef<string | null>(null)
  const pendingTargetCollectionIdRef = useRef<string | null>(null)
  // Captured at submit time so the success snackbar can name the target
  // collection even when fired from the subscription onComplete closure.
  const pendingCollectionTitleRef = useRef('')
  const loadingRef = useRef(false)

  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const [templateGalleryPageAssignJourney] =
    useTemplateGalleryPageAssignJourneyMutation()

  // Setup body flips mountedRef true (NES-1539 Pattern 3 — Next.js
  // dev/StrictMode trap: only flipping in cleanup leaves it permanently
  // false after the cleanup runs once).
  useEffect(() => {
    mountedRef.current = true
    return (): void => {
      mountedRef.current = false
      // Release the DnD lock and null the post-translation refs in case
      // the component unmounts mid-pipeline (route change, parent
      // re-render). Calls are idempotent: `setHasOpenDialog?.(false)`
      // is a no-op when the dialog was never opened, and the refs are
      // already null at mount. Subscription teardown happens via Apollo
      // unsubscribing when this hook unmounts.
      setHasOpenDialog?.(false)
      newJourneyIdRef.current = null
      pendingTargetCollectionIdRef.current = null
      pendingCollectionTitleRef.current = ''
    }
    // Lifecycle effect — mount/unmount only. Capturing the latest
    // `setHasOpenDialog` reference is fine because it is a prop that
    // does not change across renders in normal use.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const noActiveTeamCopy = t(
    'No active team selected. Please pick a team and try again.'
  )
  const duplicateFailCopy = t('Failed to copy the journey. Please try again.')
  const translationFailCopy = t('An error occurred while translating.')
  const assignFailCopy = t(
    "Failed to add the copy to the collection. You'll find it in All Templates — drag it into the collection from there."
  )

  const safeSetLoading = (next: boolean): void => {
    loadingRef.current = next
    if (mountedRef.current) setLoading(next)
  }

  const refetchAdminJourneys = (): void => {
    void client.refetchQueries({ include: ['GetAdminJourneys'] })
  }

  const runAssign = async (
    newJourneyId: string,
    targetCollectionId: string
  ): Promise<void> => {
    // Gate the network call itself on mount status — the assign
    // mutation would otherwise fire after unmount (subscription
    // onComplete races a closing dialog), creating a silent server-side
    // orphan the user has no UI feedback about.
    if (!mountedRef.current) return
    try {
      await templateGalleryPageAssignJourney({
        variables: { journeyId: newJourneyId, pageId: targetCollectionId }
      })
      refetchAdminJourneys()
      if (!mountedRef.current) return
      const collectionTitle = pendingCollectionTitleRef.current
      enqueueSnackbar(
        collectionTitle !== ''
          ? t('Copied to {{title}}.', { title: collectionTitle })
          : t('Copied to collection.'),
        { variant: 'success', preventDuplicate: true }
      )
      guardedClose()
    } catch {
      refetchAdminJourneys()
      if (!mountedRef.current) return
      safeSetLoading(false)
      setTranslationVariables(null)
      setErrorMessage(assignFailCopy)
    }
  }

  const handleSubmit = async (values: {
    collectionId: string
    collectionTitle: string
    language?: JourneyLanguage
    showTranslation: boolean
  }): Promise<void> => {
    // Single-flight guard — defensive against React render timing on
    // rapid double-clicks even though the dialog also disables the
    // submit button while loading.
    if (loadingRef.current) return

    const teamId = activeTeam?.id
    if (teamId == null) {
      if (mountedRef.current) setErrorMessage(noActiveTeamCopy)
      return
    }

    const journeyId = id ?? journey?.id
    if (journeyId == null) {
      if (mountedRef.current) setErrorMessage(duplicateFailCopy)
      return
    }

    safeSetLoading(true)
    pendingCollectionTitleRef.current = values.collectionTitle
    if (mountedRef.current) {
      setErrorMessage(null)
    }

    let duplicatedId: string | null = null
    try {
      const result = await journeyDuplicate({
        variables: { id: journeyId, teamId }
      })
      duplicatedId = result.data?.journeyDuplicate?.id ?? null
      if (duplicatedId == null || duplicatedId === '') {
        throw new Error('Journey duplication failed')
      }
    } catch {
      // No rollback, no refetch — nothing was created.
      if (!mountedRef.current) return
      safeSetLoading(false)
      setErrorMessage(duplicateFailCopy)
      return
    }

    newJourneyIdRef.current = duplicatedId
    pendingTargetCollectionIdRef.current = values.collectionId

    if (values.showTranslation && values.language != null) {
      const journeyLanguageName =
        journey?.language?.name?.find(({ primary }) => primary)?.value ?? ''
      if (mountedRef.current) {
        setTranslationVariables({
          journeyId: duplicatedId,
          name: journey?.title ?? '',
          journeyLanguageName,
          textLanguageId: values.language.id,
          textLanguageName:
            values.language.nativeName ?? values.language.localName ?? '',
          userLanguageId: journey?.language?.id,
          userLanguageName: journeyLanguageName
        })
      }
      // Exit — subscription's onComplete will fire runAssign.
      return
    }

    await runAssign(duplicatedId, values.collectionId)
  }

  useJourneyAiTranslateSubscription({
    variables: translationVariables ?? undefined,
    skip: translationVariables == null,
    onComplete: () => {
      if (!mountedRef.current) return
      const newJourneyId = newJourneyIdRef.current
      const targetCollectionId = pendingTargetCollectionIdRef.current
      if (newJourneyId == null || targetCollectionId == null) return
      void runAssign(newJourneyId, targetCollectionId)
    },
    onError: () => {
      refetchAdminJourneys()
      if (!mountedRef.current) return
      safeSetLoading(false)
      setTranslationVariables(null)
      setErrorMessage(translationFailCopy)
    }
  })

  const guardedClose = (): void => {
    if (!mountedRef.current) return
    setDialogOpen(false)
    setLoading(false)
    loadingRef.current = false
    setErrorMessage(null)
    setTranslationVariables(null)
    newJourneyIdRef.current = null
    pendingTargetCollectionIdRef.current = null
    pendingCollectionTitleRef.current = ''
    setHasOpenDialog?.(false)
    handleCloseMenu()
  }

  const handleMenuItemClick = (): void => {
    handleKeepMounted?.()
    handleCloseMenu()
    setHasOpenDialog?.(true)
    setDialogOpen(true)
  }

  return (
    <>
      <MenuItem
        label={t('Copy to collection...')}
        icon={<CopyToIcon color="secondary" />}
        onClick={handleMenuItemClick}
        testId="CopyToCollection"
      />
      <CopyToCollectionDialog
        open={dialogOpen}
        loading={loading}
        errorMessage={errorMessage ?? undefined}
        journeyTitle={journey?.title}
        isTranslating={translationVariables != null}
        onClose={guardedClose}
        onSubmit={(values) => {
          void handleSubmit(values)
        }}
      />
    </>
  )
}
