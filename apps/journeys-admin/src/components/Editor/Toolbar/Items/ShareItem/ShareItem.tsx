import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ComponentProps, MouseEvent, ReactElement, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import ShareIcon from '@core/shared/ui/icons/Share'
import TransformIcon from '@core/shared/ui/icons/Transform'

import { GetAdminJourneys_journeys as Journey } from '../../../../../../__generated__/GetAdminJourneys'
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
  closeMenu?: () => void
  journey?: Journey
}

export function ShareItem({
  variant,
  closeMenu,
  journey
}: ShareItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey: journeyContext } = useJourney()
  const journeyData = journeyContext ?? journey

  const journeySlug = journeyData?.slug

  const hostname =
    journeyContext?.team?.customDomains[0]?.name ??
    journeyData?.team?.customDomains[0]?.name

  const router = useRouter()
  const [showSlugDialog, setShowSlugDialog] = useState<boolean>(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState<boolean>(false)
  const [showQrCodeDialog, setShowQrCodeDialog] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
    closeMenu?.() // test e2e
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
      <Dialog open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <Stack direction="column" spacing={4}>
          <Typography variant="subtitle2" gutterBottom>
            {t('Share This Journey')}
          </Typography>
          <CopyTextField
            value={
              journeySlug != null
                ? `${
                    hostname != null
                      ? `https://${hostname}`
                      : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                        'https://your.nextstep.is')
                  }/${journeySlug}`
                : undefined
            }
          />
          <Stack direction="row" spacing={6}>
            <Button
              onClick={() => {
                console.log('clicked')
                setShowSlugDialog(true)
                setRoute('edit-url')
              }}
              size="small"
              startIcon={<Edit2Icon />}
              disabled={journeyData == null}
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
              disabled={journeyData == null}
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
              disabled={journeyData == null}
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
            >
              {t('QR Code')}
            </Button>
          </Stack>
        </Stack>
      </Dialog>
      {showSlugDialog != null && (
        <SlugDialog
          open={showSlugDialog}
          onClose={() => setShowSlugDialog(false)}
          hostname={hostname}
          journeySlug={journeySlug}
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
