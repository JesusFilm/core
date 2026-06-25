import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { useTemplateFamilyStatsAggregateLazyQuery } from '../../../libs/useTemplateFamilyStatsAggregateLazyQuery'
import { MenuItem } from '../../MenuItem'

interface CopyToTeamMenuItemProps {
  id?: string
  handleCloseMenu: () => void
  handleKeepMounted?: () => void
  journey?: Journey
  setHasOpenDialog?: (hasOpenDialog: boolean) => void
}

interface JourneyLanguage {
  id: string
  localName?: string
  nativeName?: string
}

/**
 * CopyToTeamMenuItem component provides a menu item for copying journeys between teams.
 *
 * This component:
 * - Renders a menu item that triggers a journey copy dialog
 * - Handles the journey duplication process with optional translation
 * - Supports both direct journey props and context-based journey data
 * - Uses subscription-based approach for real-time translation updates
 * - Shows real-time progress updates during the translation process
 *
 * @param {Object} props - The component props
 * @param {string} [props.id] - Optional unique identifier for the journey to be copied
 * @param {() => void} props.handleCloseMenu - Callback function to close the parent menu
 * @param {() => void} [props.handleKeepMounted] - Optional callback to keep the component mounted in the DOM
 * @param {Journey} [props.journey] - Optional journey object. If not provided, the component will use
 *                                   journey data from the JourneyProvider context
 * @returns {ReactElement} A menu item component that triggers a journey copy dialog
 */
export function CopyToTeamMenuItem({
  id,
  handleCloseMenu,
  handleKeepMounted,
  journey,
  setHasOpenDialog
}: CopyToTeamMenuItemProps): ReactElement {
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] =
    useState<boolean>(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [loading, setLoading] = useState(false)
  const [translationVariables, setTranslationVariables] = useState<
    | {
        journeyId: string
        name: string
        journeyLanguageName: string
        textLanguageId: string
        textLanguageName: string
        userLanguageId?: string
        userLanguageName?: string
      }
    | undefined
  >(undefined)
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext
  const { refetchTemplateStats } = useTemplateFamilyStatsAggregateLazyQuery()

  // The shared CopyToTeamDialog owns the team switch: it switches immediately
  // for a plain copy, and defers the switch until it closes on completion for
  // the translation flow (so the refetch doesn't unmount this component's
  // subscription mid-translation — NES-1636). This component no longer
  // switches teams itself.

  // Set up the subscription for translation
  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: !translationVariables,
    onComplete: () => {
      // Refetch template stats if the source journey has a fromTemplateId
      if (journeyData?.fromTemplateId != null) {
        void refetchTemplateStats([journeyData.fromTemplateId])
      }

      enqueueSnackbar(t('Journey Translated'), {
        variant: 'success',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined) // Reset to stop subscription
      handleCloseMenu() // Close menu when translation completes
      // Closing the dialog triggers its deferred switch to the destination team.
      setDuplicateTeamDialogOpen(false)
    },
    onError(error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined)
      handleCloseMenu() // Close menu on translation error
      setDuplicateTeamDialogOpen(false) // Close dialog on translation error
    }
  })

  const handleDuplicateJourney = async (
    teamId: string,
    selectedLanguage?: JourneyLanguage,
    showTranslation?: boolean
  ): Promise<void> => {
    if (id == null || journeyData == null) return

    setLoading(true)

    try {
      const { data: duplicateData } = await journeyDuplicate({
        variables: {
          id,
          teamId
        }
      })

      if (duplicateData?.journeyDuplicate?.id) {
        // Refetch template stats if the source journey has a fromTemplateId
        if (journeyData?.fromTemplateId != null) {
          void refetchTemplateStats([journeyData.fromTemplateId])
        }

        if (selectedLanguage == null || !showTranslation) {
          setLoading(false)
          enqueueSnackbar(t('Journey Copied'), {
            variant: 'success',
            preventDuplicate: true
          })
          // The dialog switches to the destination team and closes itself.
          handleCloseMenu()
          setDuplicateTeamDialogOpen(false)
          return
        }

        const currentLanguageName =
          journeyData.language.name.find(({ primary }) => !primary)?.value ?? ''

        // Start the translation subscription
        setTranslationVariables({
          journeyId: duplicateData.journeyDuplicate.id,
          name: journeyData.title,
          journeyLanguageName: currentLanguageName,
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? '',
          userLanguageId: journeyData.language.id,
          userLanguageName: currentLanguageName
        })

        // Don't close menu or dialog yet - wait for translation to complete
      } else {
        throw new Error('Journey duplication failed')
      }
    } catch (error) {
      setLoading(false)
      setTranslationVariables(undefined)
      enqueueSnackbar(t('Journey duplication failed'), {
        variant: 'error',
        preventDuplicate: true
      })
      handleCloseMenu()
      setDuplicateTeamDialogOpen(false)
    }
  }

  return (
    <>
      <MenuItem
        label={t('Copy to ...')}
        icon={<CopyToIcon color="secondary" />}
        onClick={() => {
          handleKeepMounted?.()
          handleCloseMenu()
          setHasOpenDialog?.(true)
          setDuplicateTeamDialogOpen(true)
        }}
        testId="Copy"
      />
      <CopyToTeamDialog
        title={t('Copy to Another Team')}
        submitLabel={t('Copy')}
        open={duplicateTeamDialogOpen}
        loading={loading}
        onClose={() => {
          setHasOpenDialog?.(false)
          setDuplicateTeamDialogOpen(false)
          // Cancel any in-flight translation so closing the dialog stops the
          // subscription cleanly instead of firing onComplete on a dismissed
          // dialog (defensive: the wrapper hides the buttons and blocks
          // backdrop/escape while translating, so this is not user-reachable
          // mid-translation today).
          setLoading(false)
          setTranslationVariables(undefined)
        }}
        submitAction={handleDuplicateJourney}
        translationProgress={{
          progress:
            translationData?.journeyAiTranslateCreateSubscription.progress ?? 0,
          message:
            translationData?.journeyAiTranslateCreateSubscription.message ?? ''
        }}
        isTranslating={translationVariables != null}
      />
    </>
  )
}
