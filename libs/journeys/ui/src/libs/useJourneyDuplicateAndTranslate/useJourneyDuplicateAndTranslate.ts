import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { useState } from 'react'

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
 * Uses subscription-based approach for real-time translation updates.
 *
 * @param {UseJourneyDuplicateAndTranslateProps} props - Props for the hook.
 * @param {string} [props.journeyId] - ID of the journey to duplicate.
 * @param {string} props.journeyTitle - Title of the journey.
 * @param {string} props.journeyLanguageName - Original journey's language name.
 * @param {() => void} [props.onSuccess] - Optional callback on success.
 * @param {() => void} [props.onError] - Optional callback on error.
 * @returns `duplicateAndTranslate` function, `loading` state, and `getTranslationVariables` helper.
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

    // Note: Translation is now handled via subscription in the component that calls this
    // The subscription should be set up separately to handle the translation process
    // We keep loading true here as the subscription will handle completion
    enqueueSnackbar(t('Journey Copied - Translation will begin shortly'), {
      variant: 'success',
      preventDuplicate: true
    })
    onSuccess?.()

    return duplicateData.journeyDuplicate.id
  }

  // Helper function to get translation variables for use with subscription
  const getTranslationVariables = (
    duplicatedJourneyId: string,
    selectedLanguage: JourneyLanguage
  ) => ({
    journeyId: duplicatedJourneyId,
    name: journeyTitle,
    journeyLanguageName,
    textLanguageId: selectedLanguage.id,
    textLanguageName:
      selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
  })

  return { duplicateAndTranslate, loading, getTranslationVariables }
}
