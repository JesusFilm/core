import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TranslationDialogWrapper } from '@core/journeys/ui/TranslationDialogWrapper'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateMutation/supportedLanguages'
import { useJourneyDuplicateAndTranslate } from '@core/journeys/ui/useJourneyDuplicateAndTranslate'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'

import { useGetCommonVideoVariantLangauges } from './utils/useGetCommonVideoVariantLangauges'

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
 * - Handles the journey translation process through the duplicateAndTranslate mutation
 * - Shows loading states during the translation process
 *
 * @param {Object} props - The component props
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {() => void} props.onClose - Callback function invoked when the dialog should close
 * @param {Journey} [props.journey] - Optional journey object containing journey data. If not provided,
 *                                   the component will attempt to use journey data from the JourneyProvider context
 * @returns {ReactElement} A dialog component with language selection and translation functionality
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

  const { commonLanguages, loading: commonLanguagesLoading } =
    useGetCommonVideoVariantLangauges(journeyData)

  console.log('commonLanguages', commonLanguages)

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
    }
  })

  const { duplicateAndTranslate, loading } = useJourneyDuplicateAndTranslate({
    journeyId: journeyData?.id,
    journeyTitle: journeyData?.title ?? '',
    journeyLanguageName:
      journeyData?.language.name.find(({ primary }) => primary)?.value ?? '',
    onSuccess: () => {
      onClose()
    }
  })

  const journeyLanguage: JourneyLanguage | undefined =
    journeyData != null
      ? {
          id: journeyData.language.id,
          localName: journeyData.language.name.find(({ primary }) => !primary)
            ?.value,
          nativeName: journeyData.language.name.find(({ primary }) => primary)
            ?.value
        }
      : undefined

  const [selectedLanguage, setSelectedLanguage] = useState<
    JourneyLanguage | undefined
  >(journeyLanguage)

  function handleDialogClose(
    _?: object,
    reason?: 'backdropClick' | 'escapeKeyDown'
  ): void {
    if (loading && (reason === 'backdropClick' || reason === 'escapeKeyDown'))
      return
    onClose()
  }

  const handleTranslate = async (): Promise<void> => {
    if (
      selectedLanguage == null ||
      journeyData == null ||
      activeTeam?.id == null
    )
      return

    await duplicateAndTranslate({
      teamId: activeTeam.id,
      selectedLanguage,
      shouldTranslate: true
    })
  }

  return (
    <TranslationDialogWrapper
      open={open}
      onClose={handleDialogClose}
      onTranslate={handleTranslate}
      loading={loading}
      title={t('Create Translated Copy')}
      loadingText={t('Translating your journey...')}
      testId="TranslateJourneyDialog"
      divider={false}
      isTranslation={true}
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
