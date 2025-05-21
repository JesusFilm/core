import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TranslationDialogWrapper } from '@core/journeys/ui/TranslationDialogWrapper'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'
import { useJourneyAiTranslateMutation } from '../../../../../libs/useJourneyAiTranslateMutation'

/**
 * Props for the TranslateJourneyDialog component
 *
 * @property {boolean} open - Controls whether the dialog is displayed
 * @property {() => void} onClose - Function to call when the dialog is closed
 * @property {Journey} [journey] - Optional journey data object. If not provided, uses journey from context
 */
export interface TranslateJourneyDialogProps {
  open: boolean
  onClose: () => void
  journey?: Journey
}

/**
 * Interface for the language object structure used in the component
 */
interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

/**
 * TranslateJourneyDialog component provides a dialog interface for translating journeys.
 *
 * The component fetches the list of available languages and allows users to select a target
 * language for translation. It gets the current journey either from props or from context.
 *
 * @param {TranslateJourneyDialogProps} props - The component props
 * @param {boolean} props.open - Controls whether the dialog is displayed
 * @param {() => void} props.onClose - Function to call when the dialog is closed
 * @param {Journey} [props.journey] - Optional journey data object. If not provided, uses journey from context
 * @returns {ReactElement} The rendered dialog component
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
  const [translate] = useJourneyAiTranslateMutation()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const [loading, setLoading] = useState(false)

  // TODO: Update so only the selected AI model + i18n languages are shown.
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

  const handleTranslate = async (): Promise<void> => {
    if (
      selectedLanguage == null ||
      journeyData == null ||
      activeTeam?.id == null
    )
      return

    try {
      setLoading(true)

      // First duplicate the journey
      const { data: duplicateData } = await journeyDuplicate({
        variables: {
          id: journeyData.id,
          teamId: activeTeam.id
        }
      })

      // Check if duplication was successful
      if (duplicateData?.journeyDuplicate?.id) {
        // Use the duplicated journey ID for translation
        const response = await translate({
          variables: {
            journeyId: duplicateData.journeyDuplicate.id,
            name: `${journeyData.title}`,
            journeyLanguageName:
              journeyData.language.name.find(({ primary }) => !primary)
                ?.value ?? '',
            textLanguageId: selectedLanguage.id,
            textLanguageName:
              selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
          }
        })

        if (response.data?.journeyAiTranslateCreate) {
          enqueueSnackbar(t('Translation complete'), {
            variant: 'success'
          })
          onClose()
        } else {
          throw new Error('Failed to start translation')
        }
      } else {
        throw new Error('Journey duplication failed')
      }
    } catch (error) {
      console.error('Error in translation process:', error)
      enqueueSnackbar(
        t('Failed to process translation request. Please try again.'),
        {
          variant: 'error'
        }
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <TranslationDialogWrapper
      open={open}
      onClose={onClose}
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
