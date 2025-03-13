import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import { ComponentProps, MouseEvent, ReactElement, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ShareIcon from '@core/shared/ui/icons/Share'

import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
import { Item } from '../Item/Item'

import { ShareDialog } from './ShareDialog'

const EmbedJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/EmbedJourneyDialog" */
      './EmbedJourneyDialog'
    ).then((mod) => mod.EmbedJourneyDialog),
  { ssr: false }
)
const SlugDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/SlugDialog" */
      './SlugDialog'
    ).then((mod) => mod.SlugDialog),
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
  closeMenu?: () => void
}

export function ShareItem({
  variant,
  closeMenu
}: ShareItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })
  const [showSlugDialog, setShowSlugDialog] = useState<boolean | undefined>()
  const [showEmbedDialog, setShowEmbedDialog] = useState<boolean | undefined>()
  const [showQrCodeDialog, setShowQrCodeDialog] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }

  function handleCloseMenu(): void {
    setAnchorEl(null)
    closeMenu?.() // test e2e
  }

  function handleSlugDialogOpen(): void {
    setShowSlugDialog(true)
  }

  function handleEmbedDialogOpen(): void {
    setShowEmbedDialog(true)
  }

  function handleQrCodeDialogOpen(): void {
    setShowQrCodeDialog(true)
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
      <ShareDialog
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        hostname={hostname}
        onSlugDialogOpen={handleSlugDialogOpen}
        onEmbedDialogOpen={handleEmbedDialogOpen}
        onQrCodeDialogOpen={handleQrCodeDialogOpen}
      />
      {showSlugDialog != null && (
        <SlugDialog
          open={showSlugDialog}
          onClose={() => setShowSlugDialog(false)}
          hostname={hostname}
        />
      )}
      {showEmbedDialog != null && (
        <EmbedJourneyDialog
          open={showEmbedDialog}
          onClose={() => setShowEmbedDialog(false)}
        />
      )}
      {showQrCodeDialog != null && (
        <QrCodeDialog
          open={showQrCodeDialog}
          onClose={() => setShowQrCodeDialog(false)}
        />
      )}
    </Box>
  )
}
