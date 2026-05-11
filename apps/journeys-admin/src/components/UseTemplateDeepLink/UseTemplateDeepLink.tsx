import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useJourneyQuery } from '@core/journeys/ui/useJourneyQuery'

import { IdType } from '../../../__generated__/globalTypes'

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

function getJourneyIdParam(
  value: string | string[] | undefined
): string | null {
  if (Array.isArray(value)) return value[0] ?? null
  if (typeof value === 'string' && value.length > 0) return value
  return null
}

/**
 * Receiver for the public template gallery's "Use" deep link
 * (`/?useTemplate=<journeyId>`).
 *
 * When the param is present, fetches the public template, opens a confirm
 * dialog defaulted to the active team, calls `journeyDuplicate` on submit,
 * routes to `/?type=journeys&refresh=true` so the new copy appears in the
 * journey list, and strips the param via shallow `router.replace` on plain
 * dismiss/error.
 */
export function UseTemplateDeepLink(): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()

  const journeyId = getJourneyIdParam(router.query.useTemplate)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [translationVariables, setTranslationVariables] = useState<
    TranslationVariables | undefined
  >(undefined)

  // Set true the moment a success/error path issues `router.replace` to the
  // journey list. CopyToTeamDialog calls `onClose()` after submitAction
  // resolves on the non-translation success path; without this guard,
  // handleClose would fire `stripParamFromUrl` and clobber the intentional
  // `?type=journeys&refresh=true` destination back to bare `/`.
  const navigatedAwayRef = useRef(false)

  useEffect(() => {
    if (journeyId != null) setOpen(true)
  }, [journeyId])

  const { data: journeyData } = useJourneyQuery(
    journeyId != null
      ? {
          id: journeyId,
          idType: IdType.databaseId,
          options: { skipRoutingFilter: true }
        }
      : undefined
  )
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
      if (journeyId == null) return

      const wantsTranslation =
        showTranslation === true && selectedLanguage != null

      // Translation needs the source journey to read its current language
      // metadata; surface a hint instead of silently swallowing the click.
      if (wantsTranslation && journey == null) {
        enqueueSnackbar(t('Loading template — please retry'), {
          variant: 'info',
          preventDuplicate: true
        })
        return
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

  if (journeyId == null) return null

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
      journeyIsTemplate={journey?.template ?? true}
      journeyFromTemplateId={journey?.fromTemplateId}
      defaultToActiveTeam
    />
  )
}
