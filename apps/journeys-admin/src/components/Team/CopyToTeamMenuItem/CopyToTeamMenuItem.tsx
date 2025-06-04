import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyAiTranslateSubscription } from '@core/journeys/ui/useJourneyAiTranslateSubscription'
import { useJourneyDuplicateMutation } from '@core/journeys/ui/useJourneyDuplicateMutation'
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
 * - Integrates with the router for URL parameter management
 * - Tracks page views through beacon analytics
 * - Supports both direct journey props and context-based journey data
 * - Uses subscription-based approach for real-time translation updates
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
  const router = useRouter()
  const [duplicateTeamDialogOpen, setDuplicateTeamDialogOpen] =
    useState<boolean>(false)
  const [journeyDuplicate] = useJourneyDuplicateMutation()
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')
  const [loading, setLoading] = useState(false)
  const [translationProgress, setTranslationProgress] = useState<{
    progress: number
    message: string
  } | null>(null)
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
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext

  // Set up the subscription for translation
  const { data: translationData, error: translationError } =
    useJourneyAiTranslateSubscription({
      variables: translationVariables,
      skip: !translationVariables,
      onData: ({ data }) => {
        if (data.data?.journeyAiTranslateCreateSubscription) {
          const progressData = data.data.journeyAiTranslateCreateSubscription

          // Update progress
          setTranslationProgress({
            progress: progressData.progress ?? 0,
            message: progressData.message ?? ''
          })

          // Check if translation is complete
          if (progressData.journey && progressData.progress === 100) {
            enqueueSnackbar(t('Journey Translated'), {
              variant: 'success',
              preventDuplicate: true
            })
            setLoading(false)
            setTranslationProgress(null)
            setTranslationVariables(undefined) // Reset to stop subscription
          }
        }
      }
    })

  // Handle translation errors
  if (translationError) {
    enqueueSnackbar(translationError.message, {
      variant: 'error',
      preventDuplicate: true
    })
    setLoading(false)
    setTranslationProgress(null)
    setTranslationVariables(undefined)
  }

  const handleDuplicateJourney = async (
    teamId: string,
    selectedLanguage?: JourneyLanguage,
    showTranslation?: boolean
  ): Promise<void> => {
    if (id == null || journeyData == null) return

    setLoading(true)
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
        return
      }

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

      handleCloseMenu()
      setDuplicateTeamDialogOpen(false)
      setLoading(false)
    } else {
      enqueueSnackbar(t('Journey duplication failed'), {
        variant: 'error',
        preventDuplicate: true
      })
      handleCloseMenu()
      setDuplicateTeamDialogOpen(false)
      setLoading(false)
    }
  }

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  return (
    <>
      <MenuItem
        label={t('Copy to ...')}
        icon={<CopyToIcon color="secondary" />}
        onClick={() => {
          handleKeepMounted?.()
          handleCloseMenu()
          setRoute('copy-journey')
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
        translationProgress={translationProgress ?? undefined}
      />
    </>
  )
}
