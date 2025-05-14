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

/**
 * Interface for the language object structure used in the component
 */
interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

/**
 * Interface for translation parameters
 */
interface TranslationParams {
  journeyId: string
  name: string
  journeyLanguageName: string
  textLanguageId: string
  textLanguageName: string
  forceTranslate?: boolean
}

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
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
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
 * @param {() => Promise<ApolloQueryResult<GetAdminJourneys>>} [props.refetch] - Function to call when the journey is duplicated
 * @returns {ReactElement} The rendered dialog component
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
  const [translationParams, setTranslationParams] =
    useState<TranslationParams | null>(null)

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

        setTranslationParams(translationParams)
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

  async function handleConfirmTranslate(): Promise<void> {
    if (!duplicatedJourneyId || !translationParams) return

    try {
      setLoading(true)

      const translatedJourney = await translateJourney({
        ...translationParams,
        forceTranslate: true
      })

      if (translatedJourney) {
        enqueueSnackbar(t('Translation complete'), {
          variant: 'success'
        })
        setShowConfirmationDialog(false)
        onClose()
        setTranslationParams(null)
        setDuplicatedJourneyId(null)
      } else {
        throw new Error('Failed to translate journey')
      }
    } catch (error) {
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

  async function handleCancelConfirmation(): Promise<void> {
    try {
      await deleteJourney()
      await refetch?.()
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    } finally {
      setShowConfirmationDialog(false)
    }
  }

  /**
   * Handles the translate dialog close event, checking both loading state and close reason
   *
   * @param reason The reason for closing ('backdropClick', 'escapeKeyDown' or undefined)
   */
  function handleTranslateDialogClose(
    _?: object,
    reason?: 'backdropClick' | 'escapeKeyDown'
  ): void {
    if (loading && (reason === 'backdropClick' || reason === 'escapeKeyDown'))
      return
    onClose()
  }

  /**
   * Handles the confirmation dialog close event
   *
   * @param reason The reason for closing ('backdropClick', 'escapeKeyDown' or undefined)
   */
  function handleConfirmDialogClose(
    _?: object,
    reason?: 'backdropClick' | 'escapeKeyDown'
  ): void {
    if (loading && (reason === 'backdropClick' || reason === 'escapeKeyDown'))
      return
    void handleCancelConfirmation()
  }

  return (
    <>
      <TranslationDialogWrapper
        open={open && !showConfirmationDialog}
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
      {showConfirmationDialog && (
        <ConfirmSameLanguageDialog
          open={showConfirmationDialog}
          onClose={handleConfirmDialogClose}
          onConfirm={handleConfirmTranslate}
          loading={loading}
          language={translationParams?.textLanguageName ?? ''}
        />
      )}
    </>
  )
}
