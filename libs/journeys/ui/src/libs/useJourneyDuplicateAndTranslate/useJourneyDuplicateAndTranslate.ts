import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

import { useJourneyAiTranslateMutation } from '../useJourneyAiTranslateMutation'
import { useJourneyDuplicateMutation } from '../useJourneyDuplicateMutation'

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

interface UseJourneyDuplicateAndTranslateProps {
  journeyId?: string
  journeyTitle: string
  journeyLanguageName: string
  onSuccess?: () => void
  onError?: () => void
}

interface DuplicateAndTranslateProps {
  teamId: string
  selectedLanguage?: JourneyLanguage
  shouldTranslate?: boolean
}

/**
 * Custom hook to duplicate and optionally translate a journey.
 *
 * @param {UseJourneyDuplicateAndTranslateProps} props - Props for the hook.
 * @param {string} [props.journeyId] - ID of the journey to duplicate.
 * @param {string} props.journeyTitle - Title of the journey.
 * @param {string} props.journeyLanguageName - Original journey's language name.
 * @param {() => void} [props.onSuccess] - Optional callback on success.
 * @param {() => void} [props.onError] - Optional callback on error.
 * @returns `duplicateAndTranslate` function and `loading` state.
 */
export function useJourneyDuplicateAndTranslate({
  journeyId,
  journeyTitle,
  journeyLanguageName,
  onSuccess,
  onError
}: UseJourneyDuplicateAndTranslateProps) {
  const { t } = useTranslation('libs-journeys-ui')
  const { enqueueSnackbar } = useSnackbar()
  const [translateJourney] = useJourneyAiTranslateMutation()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const [loading, setLoading] = useState(false)

  const duplicateAndTranslate = async ({
    teamId,
    selectedLanguage,
    shouldTranslate
  }: DuplicateAndTranslateProps): Promise<string | undefined> => {
    if (journeyId == null) return

    setLoading(true)
    const { data: duplicateData } = await journeyDuplicate({
      variables: { id: journeyId, teamId }
    })

    if (!duplicateData?.journeyDuplicate?.id) {
      setLoading(false)
      enqueueSnackbar(t('Journey duplication failed'), {
        variant: 'error',
        preventDuplicate: true
      })
      onError?.()
      return
    }

    if (selectedLanguage == null || !shouldTranslate) {
      setLoading(false)
      enqueueSnackbar(t('Journey Copied'), {
        variant: 'success',
        preventDuplicate: true
      })
      onSuccess?.()
      return duplicateData.journeyDuplicate.id
    }

    await translateJourney({
      variables: {
        journeyId: duplicateData.journeyDuplicate.id,
        name: journeyTitle,
        journeyLanguageName,
        textLanguageId: selectedLanguage.id,
        textLanguageName:
          selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
      },
      onCompleted() {
        setLoading(false)
        enqueueSnackbar(t('Journey Translated'), {
          variant: 'success',
          preventDuplicate: true
        })
        onSuccess?.()
      },
      onError(error) {
        setLoading(false)
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
        onError?.()
      }
    })

    return duplicateData.journeyDuplicate.id
  }

  return { duplicateAndTranslate, loading }
}
