import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  hostname?: string
  onSlugDialogOpen: () => void
  onEmbedDialogOpen: () => void
  onQrCodeDialogOpen: () => void
}

export function ShareDialog({
  open,
  onClose,
  hostname,
  onSlugDialogOpen,
  onEmbedDialogOpen,
  onQrCodeDialogOpen
}: ShareDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const router = useRouter()
  const [currentParam, setCurrentParam] = useState<string | null>(null)

  // Handle route change with proper cleanup
  useEffect(() => {
    if (currentParam == null) return

    const handleRouteChange = (): void => {
      setBeaconPageViewed(currentParam)
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    // Cleanup function to remove the listener when component unmounts or currentParam changes
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
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

  // Always use default URL if hostname is not available
  const shareUrl =
    journey?.slug != null
      ? `${
          hostname != null
            ? `https://${hostname}`
            : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
              'https://your.nextstep.is')
        }/${journey.slug}`
      : undefined

  // Set the buttonsDisabled state based on journey availability
  const buttonsDisabled = journey == null

  return (
    <Dialog open={open} onClose={onClose}>
      <Stack direction="column" spacing={4}>
        <Typography variant="subtitle2" gutterBottom>
          {t('Share This Journey')}
        </Typography>
        <CopyTextField value={shareUrl} />
        <Stack direction="row" spacing={6}>
          <Button
            onClick={() => {
              onSlugDialogOpen()
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
              onEmbedDialogOpen()
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
              onQrCodeDialogOpen()
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
    </Dialog>
  )
}
