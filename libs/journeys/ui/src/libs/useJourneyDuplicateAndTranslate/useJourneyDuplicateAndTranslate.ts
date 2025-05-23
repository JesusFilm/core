import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'

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

  const duplicateAndTranslate = async (
    teamId: string,
    selectedLanguage?: JourneyLanguage,
    showTranslation?: boolean
  ): Promise<string | undefined> => {
    if (journeyId == null) return

    const { data: duplicateData } = await journeyDuplicate({
      variables: { id: journeyId, teamId }
    })

    if (!duplicateData?.journeyDuplicate?.id) {
      enqueueSnackbar(t('Journey duplication failed'), {
        variant: 'error',
        preventDuplicate: true
      })
      onError?.()
      return
    }

    if (selectedLanguage == null || !showTranslation) {
      enqueueSnackbar(t('Journey Copied'), {
        variant: 'success',
        preventDuplicate: true
      })
      onSuccess?.()
      return duplicateData.journeyDuplicate.id
    }

    // Note: Translation is now handled via subscription in the component that calls this
    // The subscription should be set up separately to handle the translation process
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

  return { duplicateAndTranslate, getTranslationVariables }
}
