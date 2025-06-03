import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TranslationDialogWrapper } from '@core/journeys/ui/TranslationDialogWrapper'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
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

  const handleClose = useCallback((): void => {
    // Reset all dialog state when closing
    setLoading(false)
    setTranslationVariables(undefined)
    setSelectedLanguage(journeyLanguage)
    onClose()
  }, [journeyLanguage, onClose])

  // Set up the subscription for translation
  const { data: translationData, error: translationError } =
    useJourneyAiTranslateSubscription({
      variables: translationVariables,
      skip: !translationVariables
    })

  // Handle translation errors
  if (translationError) {
    enqueueSnackbar(translationError.message, {
      variant: 'error'
    })
    setLoading(false)
    setTranslationVariables(undefined)
  }

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [
        // in i18n:
        '529', // English
        '4415', // Italiano, Italian
        '1106', // Deutsch, German, Standard
        '4451', // polski, Polish
        '496', // Français, French
        '20526', // Shqip, Albanian
        '584', // Português, Portuguese, Brazil
        '21028', // Español, Spanish, Latin American
        '20615', // 普通話, Chinese, Mandarin
        '3934', // Русский, Russian
        '22658', // Arabic Modern
        '7083', // Japanese
        '16639', // Bahasa Indonesia
        '3887', // Vietnamese
        '13169', // Thai
        '6464', // Hindi
        '12876', // Ukrainian
        '53441', // Arabic, Egyptian Modern Standard
        '1942', // Türkçe, Turkish
        '5541', // Serbian
        '6788', // Farsi, Western
        '3804', // Korean
        // supported by AI model:
        '139081', // Bengali
        '1964', // Bulgarian
        '21754', // Chinese (Simplified)
        '21753', // Chinese (Traditional)
        '1109', // Croatian
        '4432', // Czech
        '4454', // Danish
        '1269', // Dutch
        '4601', // Estonian
        '4820', // Finnish
        '483', // Greek
        '6930', // Hebrew
        '1107', // Hungarian
        '7519', // Latvian
        '7698', // Lithuanian
        '10393', // Norwegian
        '5546', // Romanian
        '5541', // Serbian
        '5545', // Slovak
        '1112', // Slovenian
        '23178', // Swahili, Tanzania
        '4823' // Swedish
      ]
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

  useEffect(() => {
    if (
      translationData?.journeyAiTranslateCreateSubscription.progress === 100
    ) {
      handleClose()
    }
  }, [
    translationData?.journeyAiTranslateCreateSubscription.progress,
    handleClose
  ])

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
      translationProgress={{
        progress:
          translationData?.journeyAiTranslateCreateSubscription.progress ?? 0,
        message:
          translationData?.journeyAiTranslateCreateSubscription.message ?? ''
      }}
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
