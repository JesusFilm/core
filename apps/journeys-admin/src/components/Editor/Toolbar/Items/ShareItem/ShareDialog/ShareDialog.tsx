import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import TransformIcon from '@core/shared/ui/icons/Transform'

import { useCustomDomainsQuery } from '../../../../../../libs/useCustomDomainsQuery'

const EmbedJourneyDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/EmbedJourneyDialog" */
      '../EmbedJourneyDialog'
    ).then((mod) => mod.EmbedJourneyDialog),
  { ssr: false }
)
const SlugDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/SlugDialog" */
      '../SlugDialog'
    ).then((mod) => mod.SlugDialog),
  { ssr: false }
)

const QrCodeDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/EditorToolbar/ShareButton/QrCodeDialog" */
      '../QrCodeDialog'
    ).then((mod) => mod.QrCodeDialog),
  { ssr: false }
)

interface ShareDialogProps {
  open: boolean
  onClose: () => void
}

export function ShareDialog({ open, onClose }: ShareDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()
  const [currentParam, setCurrentParam] = useState<string | null>(null)

  const [showSlugDialog, setShowSlugDialog] = useState<boolean | undefined>()
  const [showEmbedDialog, setShowEmbedDialog] = useState<boolean | undefined>()
  const [showQrCodeDialog, setShowQrCodeDialog] = useState<boolean>(false)

  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journey?.team?.id ?? '' },
    skip: journey?.team?.id == null
  })

  // Handle route change with proper cleanup
  useEffect(() => {
    if (currentParam == null) return

    const handleRouteChange = (): void => {
      setBeaconPageViewed(currentParam)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      if (typeof router.events.off === 'function') {
        router.events.off('routeChangeComplete', handleRouteChange)
      }
    }
  }, [currentParam, router.events])

  const setRoute = useCallback(
    (param: string): void => {
      setCurrentParam(param)
      void router.push({ query: { ...router.query, param } }, undefined, {
        shallow: true
      })
    },
    [router]
  )

  const shareUrl =
    journey?.slug != null
      ? `${
          hostname != null
            ? `https://${hostname}`
            : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
              'https://your.nextstep.is')
        }/${journey.slug}`.replace(/([^:]\/)\/+/g, '$1')
      : undefined

  const buttonsDisabled = journey == null

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
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: t('Share This Journey'),
        closeButton: true
      }}
    >
      <Stack direction="column" spacing={4}>
        <CopyTextField value={shareUrl} />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 6 }}
          sx={{ width: '100%' }}
        >
          <Button
            onClick={() => {
              handleSlugDialogOpen()
              setRoute('edit-url')
            }}
            size="small"
            startIcon={<Edit2Icon />}
            disabled={buttonsDisabled}
            style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {t('Edit URL')}
          </Button>
          <Button
            onClick={() => {
              handleEmbedDialogOpen()
              setRoute('embed-journey')
            }}
            size="small"
            startIcon={<Code1Icon />}
            disabled={buttonsDisabled}
            style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {t('Embed Journey')}
          </Button>
          <Button
            onClick={() => {
              handleQrCodeDialogOpen()
              setRoute('qr-code')
            }}
            size="small"
            startIcon={<TransformIcon />}
            disabled={buttonsDisabled}
            style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {t('QR Code')}
          </Button>
        </Stack>
      </Stack>

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
          hostname={hostname}
          journey={journey}
        />
      )}
      {showQrCodeDialog != null && (
        <QrCodeDialog
          open={showQrCodeDialog}
          onClose={() => setShowQrCodeDialog(false)}
        />
      )}
    </Dialog>
  )
}
