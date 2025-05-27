import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { CopyToTeamDialog } from '@core/journeys/ui/CopyToTeamDialog'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useJourneyDuplicateAndTranslate } from '@core/journeys/ui/useJourneyDuplicateAndTranslate'
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
  const { t } = useTranslation('apps-journeys-admin')
  const { journey: journeyFromContext } = useJourney()
  const journeyData = journey ?? journeyFromContext

  const { duplicateAndTranslate, loading } = useJourneyDuplicateAndTranslate({
    journeyId: journeyData?.id,
    journeyTitle: journeyData?.title ?? '',
    journeyLanguageName:
      journeyData?.language.name.find(({ primary }) => primary)?.value ?? '',
    onSuccess: () => {
      setDuplicateTeamDialogOpen(false)
    },
    onError: () => {
      setDuplicateTeamDialogOpen(false)
    }
  })

  const handleDuplicateJourney = async (
    teamId: string,
    selectedLanguage?: JourneyLanguage,
    showTranslation?: boolean
  ): Promise<void> => {
    if (id == null || journeyData == null) return

    await duplicateAndTranslate({
      teamId,
      selectedLanguage,
      shouldTranslate: showTranslation
    })
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
      />
    </>
  )
}
