import { Theme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'
import { Dialog } from '@core/shared/ui/Dialog'
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
  const [loading, setLoading] = useState(false)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey: journeyFromContext } = useJourney()
  const { activeTeam } = useTeam()
  const journeyData = journey ?? journeyFromContext
  const { enqueueSnackbar } = useSnackbar()
  const { translateJourney } = useJourneyAiTranslateMutation()
  const [journeyDuplicate] = useJourneyDuplicateMutation()

  // TODO: Update so only the selected AI model + i18n languages are shown.
  const { data: languagesData, loading: languagesLoading } = useLanguagesQuery({
    languageId: '529'
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

    // Check if selected language is the same as the source journey's language
    if (selectedLanguage.id === journeyData.language.id) {
      enqueueSnackbar(
        t('The selected language is the same as the source journey language.'),
        { variant: 'warning' }
      )
      return
    }

    setLoading(true)

    try {
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
        const jobId = await translateJourney({
          journeyId: duplicateData.journeyDuplicate.id,
          name: `${journeyData.title} (${selectedLanguage.nativeName ?? selectedLanguage.localName})`,
          journeyLanguageName:
            journeyData.language.name.find(({ primary }) => !primary)?.value ??
            '',
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
        })

        if (jobId) {
          enqueueSnackbar(
            t('Translation started. You will be notified when it completes.'),
            {
              variant: 'success'
            }
          )
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
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Create Translated Copy'), closeButton: true }}
      dialogAction={{
        onSubmit: handleTranslate,
        submitLabel: t('Create'),
        closeLabel: t('Cancel')
      }}
      loading={loading}
      testId="TranslateJourneyDialog"
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
    </Dialog>
  )
}
