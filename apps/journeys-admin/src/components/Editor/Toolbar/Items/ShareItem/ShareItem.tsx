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
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { CopyTextField } from '@core/shared/ui/CopyTextField'
import { Dialog } from '@core/shared/ui/Dialog'
import Code1Icon from '@core/shared/ui/icons/Code1'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import ShareIcon from '@core/shared/ui/icons/Share'
import TransformIcon from '@core/shared/ui/icons/Transform'

import { GetJourneyForSharing_journey as JourneyForSharing } from '../../../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as ContextJourney } from '../../../../../../__generated__/JourneyFields'
import { useCustomDomainsQuery } from '../../../../../libs/useCustomDomainsQuery'
import { useJourneyForSharingLazyQuery } from '../../../../../libs/useJourneyForShareLazyQuery/useJourneyForShareLazyQuery'
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
  journeyId?: string
}

export function ShareItem({
  variant,
  closeMenu,
  journeyId
}: ShareItemProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey: journeyContext } = useJourney()
  const { hostname } = useCustomDomainsQuery({
    variables: { teamId: journeyContext?.team?.id ?? '' },
    skip: journeyContext?.team?.id == null
  })

  // Lazy query for journey data if context is missing
  const [loadJourney, { data: journeyShareData, loading, error }] =
    useJourneyForSharingLazyQuery()

  /**
   * The journey data to be used for sharing.
   *
   * This variable may be sourced from either the JourneyProvider context (`ContextJourney`)
   * or from a lazy GraphQL query (`LazyJourney`). Both types are expected to be structurally
   * similar, but may diverge if their respective GraphQL fragments change.
   *
   * ShareItem.tsx uses the lazy query to get the journey slug, hostname/custom domain if there is no journeyContext.
   *
   * ⚠️ Note: If you access properties that are not guaranteed to exist on both types,
   * use type guards or map to a common interface to avoid runtime errors.
   *
   * Guaranteed properties:
   * id, slug, team.id, team.customDomains (array, may be empty), team.customDomains[0]?.name (may be undefined if no custom domains)
   *
   * @type {ContextJourney | JourneyForSharing | undefined}
   */
  const journeyData: ContextJourney | JourneyForSharing | undefined =
    journeyContext ?? journeyShareData?.journey

  const shouldUseLazyQuery = journeyContext == null

  const journeySlug = journeyData?.slug
  const selectedHostname =
    hostname ?? journeyShareData?.journey?.team?.customDomains?.[0]?.name

  const router = useRouter()
  const [showSlugDialog, setShowSlugDialog] = useState<boolean>(false)
  const [showEmbedDialog, setShowEmbedDialog] = useState<boolean>(false)
  const [showQrCodeDialog, setShowQrCodeDialog] = useState<boolean>(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  // Trigger lazy query when dialog opens and context is missing
  const handleShowMenu = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
    if (shouldUseLazyQuery && !journeyShareData) {
      if (journeyId == null) return
      void loadJourney({ variables: { id: journeyId } })
    }
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
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight={120}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            minHeight={120}
          >
            <Typography color="error" variant="body2" gutterBottom>
              {t('Failed to load journey data. Please try again.')}
            </Typography>
          </Box>
        ) : journeyData != null ? (
          <Stack direction="column" spacing={4}>
            <Typography variant="subtitle2" gutterBottom>
              {t('Share This Journey')}
            </Typography>
            <CopyTextField
              value={
                journeySlug != null
                  ? `${
                      selectedHostname != null
                        ? `https://${selectedHostname}`
                        : (process.env.NEXT_PUBLIC_JOURNEYS_URL ??
                          'https://your.nextstep.is')
                    }/${journeySlug}`
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
        ) : null}
      </Dialog>
      {showSlugDialog != null && (
        <SlugDialog
          open={showSlugDialog}
          onClose={() => setShowSlugDialog(false)}
          hostname={selectedHostname}
          journeySlug={journeySlug}
          journeyId={journeyId}
        />
      )}
      {showEmbedDialog != null && (
        <EmbedJourneyDialog
          open={showEmbedDialog}
          onClose={() => setShowEmbedDialog(false)}
          journeySlug={journeySlug}
        />
      )}
      {showQrCodeDialog != null && (
        <QrCodeDialog
          open={showQrCodeDialog}
          onClose={() => setShowQrCodeDialog(false)}
          journeyId={journeyId}
          teamId={journeyData?.team?.id}
        />
      )}
    </Box>
  )
}
