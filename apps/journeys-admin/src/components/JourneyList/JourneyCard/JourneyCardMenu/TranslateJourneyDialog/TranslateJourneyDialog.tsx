import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { TranslationDialogWrapper } from '@core/journeys/ui/TranslationDialogWrapper'
import { useJourneyAiTranslateMutation } from '@core/journeys/ui/useJourneyAiTranslateMutation'
import { SUPPORTED_LANGUAGE_IDS } from '@core/journeys/ui/useJourneyAiTranslateMutation/supportedLanguages'
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

  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529',
    where: {
      ids: [...SUPPORTED_LANGUAGE_IDS]
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

      const { data: duplicateData } = await journeyDuplicate({
        variables: {
          id: journeyData.id,
          teamId: activeTeam.id
        }
      })

      if (duplicateData?.journeyDuplicate?.id) {
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
