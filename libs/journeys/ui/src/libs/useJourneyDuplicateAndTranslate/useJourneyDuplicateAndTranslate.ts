import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'

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
        enqueueSnackbar(t('Journey Translated'), {
          variant: 'success',
          preventDuplicate: true
        })
        onSuccess?.()
      },
      onError(error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
        onError?.()
      }
    })

    return duplicateData.journeyDuplicate.id
  }

  return { duplicateAndTranslate }
}
