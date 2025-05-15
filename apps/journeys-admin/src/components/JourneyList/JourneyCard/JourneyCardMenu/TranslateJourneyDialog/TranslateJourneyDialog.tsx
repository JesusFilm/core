import { ApolloQueryResult, useMutation } from '@apollo/client'
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

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JourneyDelete } from '../../../../../../__generated__/JourneyDelete'
import { useJourneyAiTranslateMutation } from '../../../../../libs/useJourneyAiTranslateMutation'
import { JOURNEY_DELETE } from '../DeleteJourneyDialog/DeleteJourneyDialog'

import { ConfirmSameLanguageDialog } from './ConfirmSameLanguageDialog'

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

interface TranslationParams {
  journeyId: string
  name: string
  journeyLanguageName: string
  textLanguageId: string
  textLanguageName: string
}

interface TranslateJourneyDialogProps {
  open: boolean
  onClose: () => void
  journey?: Journey
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

/**
 * Dialog component that enables users to create translated copies of journeys.
 *
 * This component handles the language selection, journey duplication, and translation processes.
 * It displays a confirmation dialog if the system detects the same language has been selected,
 * and provides appropriate loading states and error handling throughout the translation flow.
 *
 * @param open Controls whether the dialog is displayed
 * @param onClose Function to call when the dialog is closed
 * @param journey Optional journey data object. If not provided, uses journey from context
 * @param refetch Function to refetch journeys after translation completes
 * @returns Dialog interface for translating journeys
 */
export function TranslateJourneyDialog({
  open,
  onClose,
  journey,
  refetch
}: TranslateJourneyDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { journey: journeyFromContext } = useJourney()
  const { activeTeam } = useTeam()
  const journeyData = journey ?? journeyFromContext
  const { enqueueSnackbar } = useSnackbar()
  const { translateJourney } = useJourneyAiTranslateMutation()
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const [loading, setLoading] = useState(false)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [duplicatedJourneyId, setDuplicatedJourneyId] = useState<string | null>(
    null
  )

  const [deleteJourney] = useMutation<JourneyDelete>(JOURNEY_DELETE, {
    variables: {
      ids: [duplicatedJourneyId]
    },
    optimisticResponse: {
      journeysDelete: [
        {
          id: duplicatedJourneyId ?? '',
          status: JourneyStatus.deleted,
          __typename: 'Journey'
        }
      ]
    }
  })

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

  async function handleTranslate(): Promise<void> {
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
        setDuplicatedJourneyId(duplicateData.journeyDuplicate.id)

        const translationParams: TranslationParams = {
          journeyId: duplicateData.journeyDuplicate.id,
          name: journeyData.title,
          journeyLanguageName:
            journeyData.language.name.find(({ primary }) => !primary)?.value ??
            '',
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
        }

        try {
          await translateJourney(translationParams)
          enqueueSnackbar(t('Translation complete'), {
            variant: 'success'
          })
          onClose()
        } catch {
          setShowConfirmationDialog(true)
        }
      } else {
        throw new Error('Journey duplication failed')
      }
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    } finally {
      setLoading(false)
    }
  }

  function handleTranslateDialogClose(
    _?: object,
    reason?: 'backdropClick' | 'escapeKeyDown'
  ): void {
    if (loading && (reason === 'backdropClick' || reason === 'escapeKeyDown'))
      return
    onClose()
  }

  // function handleConfirmDialogClose(
  //   _?: object,
  //   reason?: 'backdropClick' | 'escapeKeyDown'
  // ): void {
  //   if (loading && (reason === 'backdropClick' || reason === 'escapeKeyDown'))
  //     return
  //   void handleCancelConfirmation()
  // }

  return (
    <>
      <TranslationDialogWrapper
        open={open}
        onClose={handleTranslateDialogClose}
        onTranslate={handleTranslate}
        loading={loading}
        title={t('Create Translated Copy')}
        loadingText={t('Translating your journey...')}
        testId="TranslateJourneyDialog"
        divider={false}
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
    </>
  )
}
