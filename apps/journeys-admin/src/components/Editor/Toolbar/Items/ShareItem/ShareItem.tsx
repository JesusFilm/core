import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, MouseEvent, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import ShareIcon from '@core/shared/ui/icons/Share'
import TransformIcon from '@core/shared/ui/icons/Transform'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../../../__generated__/JourneyFields'
import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
import { Item } from '../Item/Item'

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
 * @returns {ReactElement} Share button/menu item with sharing dialog
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
  const [showSlugDialog, setShowSlugDialog] = useState<boolean | null>(null)
  const [showEmbedDialog, setShowEmbedDialog] = useState<boolean | null>(null)
  const [showQrCodeDialog, setShowQrCodeDialog] = useState<boolean | null>(null)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
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

  return (
    <Box data-testid="ShareItem">
      <Item
        variant={variant}
        label={t('Share')}
        icon={<ShareIcon />}
        onClick={handleShowMenu}
        ButtonProps={{ variant: 'contained' }}
      />
      <Dialog
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null)
        }}
      >
        {journey == null ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={120}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack direction="column" spacing={4}>
            <Typography variant="subtitle2" gutterBottom>
              {t('Share This Journey')}
            </Typography>
            <CopyTextField
              value={
                journey?.slug != null
                  ? `${
                      hostname != null
                        ? `https://${hostname}`
                        : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                          'https://your.nextstep.is')
                    }/${journey?.slug}`
                  : undefined
              }
            />
            <Stack direction="row" spacing={6}>
              <Button
                onClick={() => {
                  setShowSlugDialog(true)
                  setRoute('edit-url')
                }}
                size="small"
                startIcon={<Edit2Icon />}
                disabled={journey == null}
                style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
              >
                {t('Edit URL')}
              </Button>
              <Button
                onClick={() => {
                  setShowEmbedDialog(true)
                  setRoute('embed-journey')
                }}
                size="small"
                startIcon={<Code1Icon />}
                disabled={journey == null}
                style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
              >
                {t('Embed Journey')}
              </Button>
              <Button
                onClick={() => {
                  setShowQrCodeDialog(true)
                  setRoute('qr-code')
                }}
                size="small"
                startIcon={<TransformIcon />}
                disabled={journey == null}
                style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
              >
                {t('QR Code')}
              </Button>
            </Stack>
          </Stack>
        )}
      </Dialog>
      {showSlugDialog != null && (
        <SlugDialog
          open={showSlugDialog}
          onClose={() => setShowSlugDialog(false)}
          hostname={hostname}
          journey={journey}
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
