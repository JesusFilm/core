import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, useState } from 'react'

import {
  PREVIEW_IFRAME_ALLOW,
  PREVIEW_IFRAME_SANDBOX,
  qrCodeFileName
} from '@core/journeys/ui/Campaign'
import { QrCodeCanvas, downloadQrCodePng } from '@core/journeys/ui/QrCodeCanvas'
import CopyToIcon from '@core/shared/ui/icons/CopyTo'
import Download2Icon from '@core/shared/ui/icons/Download2'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import QrCode2Icon from '@core/shared/ui/icons/QrCode2'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_regions as CampaignRegion,
  GetCampaign_campaign_regions_languages as CampaignRegionLanguage
} from '../../../../../__generated__/GetCampaign'
import {
  CampaignStringKey,
  JourneyStatus
} from '../../../../../__generated__/globalTypes'
import {
  campaignShareLink,
  journeyPreviewAddress
} from '../../../../libs/campaignAddress'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { HOVER_OUTLINE_SX } from '../../Canvas/hoverOutline'
import { SelectionBadge } from '../../Canvas/SelectionBadge'
import { JourneyPasteField } from '../../Pickers/JourneyPasteField'
import { JourneyPicker } from '../../Pickers/JourneyPicker'
import { shareLanguageLabel } from '../../utils/blockLabel'
import { campaignStringText } from '../../utils/campaignStringText'
import { handleStopPropagation } from '../../utils/handleStopPropagation'
import {
  CANVAS_SCREEN_HEIGHT,
  CANVAS_SCREEN_WIDTH,
  PUBLIC_SCREEN_HEIGHT,
  PUBLIC_SCREEN_WIDTH,
  PhoneFrame
} from '../PhoneFrame'
import { regionLanguageLabel, shareLanguageState } from '../shareLanguage'

interface ShareLanguageRowProps {
  /** The Share section the row sits in; clicking the row selects it. */
  hostBlockId: string
  campaign: Campaign
  region: CampaignRegion
  regionLanguage: CampaignRegionLanguage
  onRemove: () => void
  onLink: (url: string) => Promise<void>
  onUnlink: () => Promise<void>
  onRefresh: () => void
  /** Mint the Campaign QR Code and short link for the linked journey when the row has none. */
  onCreateQrCode: () => Promise<void>
  onCopied: (shortLink: string) => void
}

/**
 * One Share Language on the canvas, as the visitor will see it: the phone
 * frame, the Share Link, Copy link and Download QR code. A live-published
 * journey previews in the frame with Open journey (the public page in a new
 * tab), Refresh from journey, Swap and Unlink beside it, and Create QR code
 * when the row has no Campaign QR Code yet. An Unlinked Language shows the frame with the "Pick a journey"
 * call to action that opens the journey picker, copy and download disabled. A
 * journey that is no longer published shows the "Journey unpublished"
 * warning in the frame instead of that call to action.
 */
export function ShareLanguageRow({
  hostBlockId,
  campaign,
  region,
  regionLanguage,
  onRemove,
  onLink,
  onUnlink,
  onRefresh,
  onCreateQrCode,
  onCopied
}: ShareLanguageRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { previewLanguageId },
    selectBlock
  } = useCampaignEditor()
  const rowId = `${hostBlockId}__${regionLanguage.languageId}`
  const [pasting, setPasting] = useState(false)
  const state = shareLanguageState(regionLanguage)
  const shortLink =
    state === 'live' ? campaignShareLink(regionLanguage.qrCode) : undefined
  const slug = regionLanguage.journey?.slug
  const openLabel = campaignStringText(
    campaign,
    CampaignStringKey.open,
    previewLanguageId,
    t('Open')
  )
  const copyLabel = campaignStringText(
    campaign,
    CampaignStringKey.copy,
    previewLanguageId,
    t('Copy link')
  )
  const downloadLabel = campaignStringText(
    campaign,
    CampaignStringKey.downloadQr,
    previewLanguageId,
    t('Download QR code')
  )

  async function handleLink(url: string): Promise<void> {
    await onLink(url)
    setPasting(false)
  }

  async function handleCopy(): Promise<void> {
    if (shortLink == null) return
    await navigator.clipboard.writeText(shortLink)
    onCopied(shortLink)
  }

  function handleDownload(): void {
    if (shortLink == null) return
    downloadQrCodePng(
      shortLink,
      qrCodeFileName(campaign, region, regionLanguage)
    )
  }

  // A row holding a QR code is never deleted from the editor: the API
  // refuses it, so the bin is disabled and points at Unlink instead.
  const removeButton = (
    <IconButton
      size="small"
      aria-label={t('Remove language')}
      disabled={regionLanguage.qrCode != null}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        handleStopPropagation(event)
        onRemove()
      }}
    >
      <Trash2Icon fontSize="small" />
    </IconButton>
  )

  return (
    <Stack
      spacing={2}
      id={rowId}
      data-testid={`ShareLanguageRow-${regionLanguage.languageId}`}
      data-state={state}
      data-hoverable
      onClick={(event: MouseEvent<HTMLElement>) => {
        handleStopPropagation(event)
        selectBlock(hostBlockId)
      }}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        p: 2,
        borderRadius: 1,
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)',
        ...HOVER_OUTLINE_SX
      }}
    >
      <SelectionBadge
        id={rowId}
        label={shareLanguageLabel(t)}
        selected={false}
      />
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography
          variant="subtitle1"
          component="span"
          data-testid="ShareLanguageLabel"
          sx={{ flexGrow: 1, color: 'var(--campaign-band-heading)' }}
        >
          {regionLanguageLabel(regionLanguage)}
        </Typography>
        {state === 'unlinked' && (
          <Chip
            size="small"
            label={t('Hidden until a journey is linked')}
            data-testid="ShareLanguageHidden"
          />
        )}
        {state === 'unpublished' && (
          <Chip
            size="small"
            color="warning"
            label={t('Journey unpublished')}
            data-testid="ShareLanguageUnpublished"
          />
        )}
        {regionLanguage.qrCode != null ? (
          <Tooltip title={t('This language has a QR code. Unlink it instead.')}>
            <span>{removeButton}</span>
          </Tooltip>
        ) : (
          removeButton
        )}
      </Stack>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}
      >
        <PhoneFrame>
          {state === 'live' && slug != null && (
            // Fills the screen so the scaled iframe starts at its top-left
            // corner rather than being centred by its larger layout box.
            <Box
              sx={{
                position: 'relative',
                width: CANVAS_SCREEN_WIDTH,
                height: CANVAS_SCREEN_HEIGHT,
                overflow: 'hidden'
              }}
            >
              <Box
                component="iframe"
                data-testid="ShareLanguagePhoneIframe"
                src={journeyPreviewAddress(slug)}
                title={regionLanguage.title ?? slug}
                sandbox={PREVIEW_IFRAME_SANDBOX}
                allow={PREVIEW_IFRAME_ALLOW}
                loading="lazy"
                sx={{
                  // Rendered at the public phone's screen width and scaled
                  // down, so the journey lays out as it does on the public
                  // page (filling the screen) rather than in a narrower
                  // layout with its own square-cornered card.
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  display: 'block',
                  width: PUBLIC_SCREEN_WIDTH,
                  height: PUBLIC_SCREEN_HEIGHT,
                  transform: `scale(${CANVAS_SCREEN_WIDTH / PUBLIC_SCREEN_WIDTH})`,
                  transformOrigin: 'top left',
                  border: 0,
                  backgroundColor: '#000000'
                }}
              />
            </Box>
          )}
          {state === 'unlinked' && (
            <Button
              variant="contained"
              size="small"
              data-testid="ShareLanguagePick"
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                handleStopPropagation(event)
                setPasting(true)
              }}
            >
              {t('Pick a journey')}
            </Button>
          )}
          {state === 'unpublished' && (
            <Typography
              variant="body2"
              align="center"
              data-testid="ShareLanguageUnpublishedWarning"
              sx={{ p: 2, color: 'warning.main' }}
            >
              {t(
                'Journey unpublished. Visitors cannot see this language until it is published again or another journey is linked.'
              )}
            </Typography>
          )}
        </PhoneFrame>
        <Stack spacing={2} sx={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
          {state !== 'unlinked' && (
            <Typography
              variant="body2"
              data-testid="ShareLanguageJourney"
              sx={{ color: 'var(--campaign-band-text)' }}
              noWrap
            >
              {regionLanguage.title ?? regionLanguage.journeyId}
              {slug != null && (
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ ml: 1, color: 'var(--campaign-band-muted)' }}
                >
                  /{slug}
                </Typography>
              )}
            </Typography>
          )}
          {shortLink != null && (
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography
                variant="body2"
                data-testid="ShareLanguageShortLink"
                noWrap
                sx={{ color: 'var(--campaign-band-text)' }}
              >
                {shortLink.replace(/^https?:\/\//, '')}
              </Typography>
              <Tooltip title={openLabel}>
                <IconButton
                  component="a"
                  href={shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={openLabel}
                  size="small"
                  onClick={handleStopPropagation}
                >
                  <LinkExternalIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <QrCodeCanvas value={shortLink} size={72} cornerRadius="6px" />
            <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Button
                size="small"
                variant="contained"
                startIcon={<CopyToIcon />}
                disabled={shortLink == null}
                data-testid="ShareLanguageCopy"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  handleStopPropagation(event)
                  void handleCopy()
                }}
              >
                {copyLabel}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<Download2Icon />}
                disabled={shortLink == null}
                data-testid="ShareLanguageDownload"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  handleStopPropagation(event)
                  handleDownload()
                }}
              >
                {downloadLabel}
              </Button>
            </Stack>
          </Stack>
          {state !== 'unlinked' && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              {regionLanguage.journeyUrl != null && (
                <Button
                  size="small"
                  color="inherit"
                  component="a"
                  href={regionLanguage.journeyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LinkExternalIcon fontSize="small" />}
                  data-testid="ShareLanguageOpenJourney"
                  onClick={handleStopPropagation}
                >
                  {t('Open journey')}
                </Button>
              )}
              {state === 'live' && regionLanguage.qrCode == null && (
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<QrCode2Icon fontSize="small" />}
                  data-testid="ShareLanguageCreateQrCode"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    handleStopPropagation(event)
                    void onCreateQrCode()
                  }}
                >
                  {t('Create QR code')}
                </Button>
              )}
              {state === 'live' && (
                <Button
                  size="small"
                  color="inherit"
                  data-testid="ShareLanguageRefresh"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => {
                    handleStopPropagation(event)
                    onRefresh()
                  }}
                >
                  {t('Refresh from journey')}
                </Button>
              )}
              <Button
                size="small"
                color="inherit"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  handleStopPropagation(event)
                  setPasting((previous) => !previous)
                }}
              >
                {t('Swap journey')}
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  handleStopPropagation(event)
                  void onUnlink()
                }}
              >
                {t('Unlink')}
              </Button>
            </Stack>
          )}
          {pasting && (
            <Stack spacing={1.5}>
              <JourneyPicker
                label={
                  state === 'unlinked'
                    ? t('Search your journeys')
                    : t('Search for a new journey')
                }
                statuses={[JourneyStatus.published]}
                autoFocus
                onLink={handleLink}
              />
              <JourneyPasteField
                label={t('or paste a link')}
                compact
                onLink={handleLink}
              />
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
