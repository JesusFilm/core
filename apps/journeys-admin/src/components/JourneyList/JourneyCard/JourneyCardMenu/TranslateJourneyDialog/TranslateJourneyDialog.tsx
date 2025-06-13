import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useMemo, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TranslationDialogWrapper } from '@core/journeys/ui/TranslationDialogWrapper'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateSubscription/supportedLanguages'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'

interface TranslateJourneyDialogProps {
  open: boolean
  onClose: () => void
  journey?: Journey
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

/**
 * TranslateJourneyDialog component provides a dialog interface for translating journeys into different languages.
 *
 * This component:
 * - Displays a modal dialog with language selection functionality
 * - Fetches and displays a list of supported languages for translation
 * - Allows users to search and select a target language
 * - Handles the journey translation process through AI translation subscription
 * - Shows real-time progress updates during the translation process
 * - Uses subscription-based approach for real-time translation updates
 *
 * @param {Object} props - The component props
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {() => void} props.onClose - Callback function invoked when the dialog should close
 * @param {Journey} [props.journey] - Optional journey object containing journey data. If not provided,
 *                                   the component will attempt to use journey data from the JourneyProvider context
 * @returns {ReactElement} A dialog component with language selection and AI translation functionality
 */
export function TranslateJourneyDialog({
  open,
  onClose,
  journey
}: TranslateJourneyDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey: journeyFromContext } = useJourney()
  const { activeTeam } = useTeam()
  const journeyData = journey ?? journeyFromContext
  const { enqueueSnackbar } = useSnackbar()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const [loading, setLoading] = useState(false)
  const [translationVariables, setTranslationVariables] = useState<
    | {
        journeyId: string
        name: string
        journeyLanguageName: string
        textLanguageId: string
        textLanguageName: string
      }
    | undefined
  >(undefined)

  const journeyLanguage: JourneyLanguage | undefined = useMemo(
    () =>
      journeyData != null
        ? {
            id: journeyData.language.id,
            localName: journeyData.language.name.find(({ primary }) => !primary)
              ?.value,
            nativeName: journeyData.language.name.find(({ primary }) => primary)
              ?.value
          }
        : undefined,
    [journeyData]
  )

  const [selectedLanguage, setSelectedLanguage] = useState<
    JourneyLanguage | undefined
  >(journeyLanguage)

  const handleClose = useCallback(
    (_?: object, reason?: 'backdropClick' | 'escapeKeyDown'): void => {
      // Prevent closing during translation if clicked outside or escape key pressed
      if (
        (loading || translationVariables != null) &&
        (reason === 'backdropClick' || reason === 'escapeKeyDown')
      )
        return

      // Reset all dialog state when closing
      setLoading(false)
      setTranslationVariables(undefined)
      setSelectedLanguage(journeyLanguage)
      onClose()
    },
    [journeyLanguage, onClose, loading, translationVariables]
  )

  // Set up the subscription for translation
  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: !translationVariables,
    onError(error) {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
      setLoading(false)
      setTranslationVariables(undefined)
    },
    onComplete() {
      handleClose()
    }
  })

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
    }
  })

  const handleTranslate = async (): Promise<void> => {
    if (
      selectedLanguage == null ||
      journeyData == null ||
      activeTeam?.id == null
    )
      return

    try {
      setLoading(true)

      const { data: duplicateData } = await journeyDuplicate({
        variables: {
          id: journeyData.id,
          teamId: activeTeam.id
        }
      })

      if (duplicateData?.journeyDuplicate?.id) {
        // Start the translation subscription
        setTranslationVariables({
          journeyId: duplicateData.journeyDuplicate.id,
          name: `${journeyData.title}`,
          journeyLanguageName:
            journeyData.language.name.find(({ primary }) => !primary)?.value ??
            '',
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
        })

        // The subscription will handle the completion and success message
      } else {
        throw new Error('Journey duplication failed')
      }
    } catch (error) {
      enqueueSnackbar(
        t('Failed to process translation request. Please try again.'),
        {
          variant: 'error'
        }
      )
      setLoading(false)
    }
  }

  return (
    <TranslationDialogWrapper
      open={open}
      onClose={handleClose}
      onTranslate={handleTranslate}
      loading={loading}
      title={t('Create Translated Copy')}
      loadingText={t('Translating your journey...')}
      testId="TranslateJourneyDialog"
      divider={false}
      isTranslation={true}
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
    >
      <LanguageAutocomplete
        onChange={async (value) => setSelectedLanguage(value)}
        value={selectedLanguage}
        languages={languagesData?.languages}
        loading={languagesLoading}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={t('Search Language')}
            label={t('Select Language')}
            variant="filled"
          />
        )}
        popper={{
          placement: !smUp ? 'top' : 'bottom'
        }}
      />
    </TranslationDialogWrapper>
  )
}
