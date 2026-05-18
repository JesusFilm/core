import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useRef, useState } from 'react'

import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'

import { IdType } from '../../../__generated__/globalTypes'

import { useTemplateDeepLinkJourneyId } from './useTemplateDeepLinkActive'

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

interface TranslationVariables {
  journeyId: string
  name: string
  journeyLanguageName: string
  textLanguageId: string
  textLanguageName: string
  userLanguageId?: string
  userLanguageName?: string
}

/**
 * Receiver for the public template gallery's "Use" deep link
 * (`/?useTemplate=<journeyId>`).
 *
 * The outer component reads the URL param via `useTemplateDeepLinkJourneyId`
 * (the activation rule lives in one place — see that hook) and renders
 * nothing when absent so no GET_JOURNEY / dialog state initialises on the
 * vast majority of admin loads. The inner component is mount-gated on
 * `journeyId` (and keyed by it) so consecutive deep-link sessions each get a
 * fresh state slate — including `navigatedAwayRef` and the cached
 * `journey` — instead of leaking across.
 */
export function UseTemplateDeepLink(): ReactElement | null {
  const journeyId = useTemplateDeepLinkJourneyId()
  if (journeyId == null) return null
  return <ActiveUseTemplateDeepLink key={journeyId} journeyId={journeyId} />
}

interface ActiveUseTemplateDeepLinkProps {
  journeyId: string
}

function ActiveUseTemplateDeepLink({
  journeyId
}: ActiveUseTemplateDeepLinkProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()

  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [translationVariables, setTranslationVariables] = useState<
    TranslationVariables | undefined
  >(undefined)

  // Set true the moment a success/error path issues `router.replace` to the
  // journey list. CopyToTeamDialog calls `onClose()` after submitAction
  // resolves on the non-translation success path; without this guard,
  // handleClose would fire `stripParamFromUrl` and clobber the intentional
  // `?type=journeys&refresh=true` destination back to bare `/`. Scoped to
  // this component instance — remount via the outer `key` keeps it fresh
  // across deep-link sessions.
  const navigatedAwayRef = useRef(false)

  const { data: journeyData } = useJourneyQuery({
    id: journeyId,
    idType: IdType.databaseId,
    options: { skipRoutingFilter: true }
  })
  const journey = journeyData?.journey

  const [journeyDuplicate] = useJourneyDuplicateMutation()

  const stripParamFromUrl = useCallback((): void => {
    const { useTemplate, ...rest } = router.query
    void router.replace({ pathname: router.pathname, query: rest }, undefined, {
      shallow: true
    })
  }, [router])

  const navigateToJourneyList = useCallback((): void => {
    navigatedAwayRef.current = true
    void router.replace(
      { pathname: '/', query: { type: 'journeys', refresh: 'true' } },
      undefined,
      { shallow: true }
    )
  }, [router])

  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: translationVariables == null,
    onComplete: () => {
      enqueueSnackbar(t('Journey Translated'), {
        variant: 'success',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
      setOpen(false)
      navigateToJourneyList()
    },
    onError(error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
      setOpen(false)
      // The duplicate mutation already succeeded before translation began,
      // so the (untranslated) journey exists. Take the user to the list
      // instead of leaving them on the deep-link URL with no breadcrumb.
      navigateToJourneyList()
    }
  })

  const handleSubmit = useCallback(
    async (
      teamId: string,
      selectedLanguage?: JourneyLanguage,
      showTranslation?: boolean
    ): Promise<void> => {
      const wantsTranslation =
        showTranslation === true && selectedLanguage != null

      // Translation needs the source journey's language metadata. Throwing
      // (instead of a plain return) halts CopyToTeamDialog's submit pipeline
      // BEFORE updateTeamState + resetForm run, so the user's selections
      // survive the retry. The throw fires before `setLoading(true)` and
      // outside the try block below — no "duplication failed" snackbar leaks.
      if (wantsTranslation && journey == null) {
        enqueueSnackbar(t('Loading template — please retry'), {
          variant: 'info',
          preventDuplicate: true
        })
        throw new Error('journey not loaded')
      }

      setLoading(true)
      try {
        const { data } = await journeyDuplicate({
          variables: { id: journeyId, teamId, forceNonTemplate: true }
        })

        if (data?.journeyDuplicate?.id == null) {
          throw new Error('Journey duplication failed')
        }

        if (!wantsTranslation || journey == null) {
          setLoading(false)
          enqueueSnackbar(t('Journey Copied'), {
            variant: 'success',
            preventDuplicate: true
          })
          navigateToJourneyList()
          // Dialog auto-closes via its own onClose call after submitAction
          // resolves; navigatedAwayRef tells handleClose to skip stripping
          // the param so the journey-list nav above isn't clobbered.
          return
        }

        const currentLanguageName =
          journey.language.name.find(({ primary }) => !primary)?.value ?? ''

        setTranslationVariables({
          journeyId: data.journeyDuplicate.id,
          name: journey.title,
          journeyLanguageName: currentLanguageName,
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? '',
          userLanguageId: journey.language.id,
          userLanguageName: currentLanguageName
        })
      } catch (error) {
        setLoading(false)
        enqueueSnackbar(t('Journey duplication failed'), {
          variant: 'error',
          preventDuplicate: true
        })
        // Re-throw so the parent dialog's submit pipeline halts before its
        // onClose call runs, keeping the dialog open for retry.
        throw error
      }
    },
    [
      journeyId,
      journey,
      journeyDuplicate,
      enqueueSnackbar,
      t,
      navigateToJourneyList
    ]
  )

  const handleClose = useCallback((): void => {
    if (loading || translationVariables != null) return
    setOpen(false)
    if (navigatedAwayRef.current) {
      navigatedAwayRef.current = false
      return
    }
    stripParamFromUrl()
  }, [loading, translationVariables, stripParamFromUrl])

  return (
    <CopyToTeamDialog
      title={t('Use This Template')}
      submitLabel={t('Add')}
      open={open}
      loading={loading}
      onClose={handleClose}
      submitAction={handleSubmit}
      translationProgress={
        translationData?.journeyAiTranslateCreateSubscription
          ? {
              progress:
                translationData.journeyAiTranslateCreateSubscription.progress ??
                0,
              message:
                translationData.journeyAiTranslateCreateSubscription.message ??
                ''
            }
          : undefined
      }
      isTranslating={translationVariables != null}
      defaultToActiveTeam
    />
  )
}
