import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import ShareIcon from '@core/shared/ui/icons/Share'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../../../__generated__/JourneyFields'
import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
import { ShareModal } from '../../../ShareModal'
import { Item } from '../Item/Item'

const EmbedJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/EmbedJourneyDialog" */
      './EmbedJourneyDialog'
    ).then((mod) => mod.EmbedJourneyDialog),
  { ssr: false }
)

const QrCodeDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/QrCodeDialog" */
      './QrCodeDialog'
    ).then((mod) => mod.QrCodeDialog),
  { ssr: false }
)

interface ShareItemProps {
  variant: ComponentProps<typeof Item>['variant']
  journey?: JourneyFromContext | JourneyFromLazyQuery
  handleCloseMenu?: () => void
  handleKeepMounted?: () => void
}

/**
 * ShareItem component provides a menu interface for sharing journeys with URL, embed, and QR code options.
 * Includes custom domain support and analytics tracking.
 *
 * @param {ShareItemProps} props - Component props
 * @param {ComponentProps<typeof Item>['variant']} props.variant - Visual variant of the share item
 * @param {(JourneyFromContext | JourneyFromLazyQuery)} [props.journey] - Journey data for sharing
 * @param {() => void} [props.handleCloseMenu] - Closes the parent menu
 * @param {() => void} [props.handleKeepMounted] - Keeps component mounted in DOM
 * @returns {ReactElement} Share button/menu item with sharing modal
 */
export function ShareItem({
  variant,
  journey,
  handleCloseMenu,
  handleKeepMounted
}: ShareItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })
  const router = useRouter()
  const [showEmbedDialog, setShowEmbedDialog] = useState<boolean | null>(null)
  const [showQrCodeDialog, setShowQrCodeDialog] = useState<boolean | null>(null)
  const [showShareModal, setShowShareModal] = useState<boolean | null>(null)

  function handleShowMenu(): void {
    setShowShareModal(true)
    handleKeepMounted?.()
    handleCloseMenu?.()
  }

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleEditUrlClick(): void {
    setRoute('edit-url')
  }

  function handleEmbedJourneyClick(): void {
    setShowEmbedDialog(true)
    setRoute('embed-journey')
  }

  function handleQrCodeClick(): void {
    setShowQrCodeDialog(true)
    setRoute('qr-code')
  }

  return (
    <Box data-testid="ShareItem">
      <Item
        variant={variant}
        label={t('Share')}
        icon={<ShareIcon />}
        onClick={handleShowMenu}
        ButtonProps={{ variant: 'contained' }}
      />
      {showShareModal && (
        <ShareModal
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          journey={journey}
          hostname={hostname}
          onEditUrlClick={handleEditUrlClick}
          onEmbedJourneyClick={handleEmbedJourneyClick}
          onQrCodeClick={handleQrCodeClick}
        />
      )}
      {showEmbedDialog != null && (
        <EmbedJourneyDialog
          open={showEmbedDialog}
          onClose={() => setShowEmbedDialog(false)}
          journey={journey}
        />
      )}
      {showQrCodeDialog != null && (
        <QrCodeDialog
          open={showQrCodeDialog}
          onClose={() => setShowQrCodeDialog(false)}
          journey={journey}
        />
      )}
    </Box>
  )
}
