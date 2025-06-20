import { useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useTeam } from '@core/journeys/ui/TeamProvider'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation'
import { UpdateLastActiveTeamId } from '@core/journeys/ui/useUpdateLastActiveTeamIdMutation/__generated__/UpdateLastActiveTeamId'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { MenuItem } from '../../MenuItem'

interface CopyToTeamMenuItemProps {
  id?: string
  handleCloseMenu: () => void
  handleKeepMounted?: () => void
  journey?: Journey
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
  journey
}: CopyToTeamMenuItemProps): ReactElement {
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] =
    useState<boolean>(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const { query, setActiveTeam } = useTeam()
  const teams = query?.data?.teams ?? []
  const [updateLastActiveTeamId, { client }] =
    useMutation<UpdateLastActiveTeamId>(UPDATE_LAST_ACTIVE_TEAM_ID)
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
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext

  const updateTeamState = (teamId: string): void => {
    setActiveTeam(teams.find((team) => team.id === teamId) ?? null)
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: teamId
        }
      },
      onCompleted() {
        void client.refetchQueries({ include: ['GetAdminJourneys'] })
      }
    })
  }

  // Set up the subscription for translation
  const { data: translationData } = useJourneyAiTranslateSubscription({
    variables: translationVariables,
    skip: !translationVariables,
    onComplete: () => {
      enqueueSnackbar(t('Journey Translated'), {
        variant: 'success',
        preventDuplicate: true
      })
      setLoading(false)
      setTranslationVariables(undefined) // Reset to stop subscription

      // Update team state when translation completes
      if (selectedTeamId) {
        updateTeamState(selectedTeamId)
      }
      handleCloseMenu() // Close menu when translation completes
      setDuplicateTeamDialogOpen(false) // Close dialog when translation completes
      setSelectedTeamId(null) // Reset selected team
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
      setSelectedTeamId(null) // Reset selected team
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
        if (selectedLanguage == null || !showTranslation) {
          setLoading(false)
          enqueueSnackbar(t('Journey Copied'), {
            variant: 'success',
            preventDuplicate: true
          })
          updateTeamState(teamId) // Update team state immediately for non-translation scenarios
          handleCloseMenu()
          setDuplicateTeamDialogOpen(false)
          return
        }

        // Store the team ID for later team state update when translation completes
        setSelectedTeamId(teamId)

        // Start the translation subscription
        setTranslationVariables({
          journeyId: duplicateData.journeyDuplicate.id,
          name: journeyData.title,
          journeyLanguageName:
            journeyData.language.name.find(({ primary }) => !primary)?.value ??
            '',
          textLanguageId: selectedLanguage.id,
          textLanguageName:
            selectedLanguage.nativeName ?? selectedLanguage.localName ?? ''
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
          setDuplicateTeamDialogOpen(false)
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
