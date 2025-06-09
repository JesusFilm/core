import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { MenuItem } from '../../MenuItem'

interface CopyToTeamMenuItemProps {
  handleCloseMenu: () => void
  setOpenCopyToTeamDialog: () => void
  journey?: Journey
}

/**
 * CopyToTeamMenuItem component provides a menu item for copying journeys between teams.
 *
 * This component:
 * - Renders a menu item that triggers a journey copy dialog
 * - Integrates with the router for URL parameter management
 * - Tracks page views through beacon analytics
 * - Sets the route parameter to 'copy-journey' when clicked
 *
 * @param {Object} props - The component props
 * @param {() => void} props.handleCloseMenu - Callback function to close the parent menu
 * @param {() => void} props.setOpenCopyToTeamDialog - Callback function to open the copy to team dialog
 * @param {Journey} [props.journey] - Optional journey object (defined in interface but not used in component)
 * @returns {ReactElement} A menu item component that triggers a journey copy dialog
 */
export function CopyToTeamMenuItem({
  handleCloseMenu,
  setOpenCopyToTeamDialog
}: CopyToTeamMenuItemProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

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
          handleCloseMenu()
          setRoute('copy-journey')
          setOpenCopyToTeamDialog()
        }}
        testId="Copy"
      />
    </>
  )
}
