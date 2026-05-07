import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useEffect, useState } from 'react'

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

function getJourneyIdParam(value: string | string[] | undefined): string | null {
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
 * routes to the journey list with the new copy in view, and strips the
 * param on close.
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
    void router.replace(
      { pathname: router.pathname, query: rest },
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
      stripParamFromUrl()
      void router.push('/?type=journeys&refresh=true')
    },
    onError(error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
      setOpen(false)
      stripParamFromUrl()
    }
  })

  const handleSubmit = useCallback(
    async (
      teamId: string,
      selectedLanguage?: JourneyLanguage,
      showTranslation?: boolean
    ): Promise<void> => {
      if (journeyId == null) return

      const wantsTranslation = showTranslation === true && selectedLanguage != null

      // Translation needs the source journey to read its current language
      // metadata; if it hasn't resolved yet the user must wait.
      if (wantsTranslation && journey == null) return

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
          void router.push('/?type=journeys&refresh=true')
          // Dialog auto-closes via its own onClose call after submitAction
          // resolves; that path fires handleClose which strips the param.
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
    [journeyId, journey, journeyDuplicate, enqueueSnackbar, t, router]
  )

  const handleClose = useCallback((): void => {
    if (loading || translationVariables != null) return
    setOpen(false)
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
