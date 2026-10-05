import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, ReactNode, useRef, useState } from 'react'

import CopyToIcon from '@core/shared/ui/icons/CopyTo'
import Download2Icon from '@core/shared/ui/icons/Download2'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'

import {
  CampaignStringKey,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { QrCodeCanvas, downloadQrCodePng } from '../../QrCodeCanvas'
import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { hasText } from '../types'
import type { CampaignPublic, CampaignRegion, CampaignTreeOf } from '../types'

export type CampaignShareLanguage = CampaignRegion['languages'][number]

/**
 * The iframe attributes every journey preview frame carries (PRD §11): no
 * top navigation and no fullscreen, popups allowed so the journey's own
 * links can open, autoplay for the first card's video.
 */
export const PREVIEW_IFRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'
export const PREVIEW_IFRAME_ALLOW = 'autoplay'

/** The preview frame's address: the root-domain embed route kept a preview with `expand=false`. */
export function previewEmbedUrl(embedUrl: string): string {
  const url = new URL(embedUrl)
  url.searchParams.set('expand', 'false')
  return url.toString()
}

/** The downloaded QR PNG's name: `<campaign slug>-<region slug>-<language bcp47>.png`. */
export function qrCodeFileName(
  campaign: Pick<CampaignPublic, 'slug'>,
  region: Pick<CampaignRegion, 'slug'>,
  language: Pick<CampaignShareLanguage, 'languageId' | 'language'>
): string {
  const bcp47 = language.language.bcp47 ?? language.languageId
  return `${campaign.slug}-${region.slug}-${bcp47}.png`
}

/** A Share Link as the phone frame shows it: without its scheme. */
export function displayShortLink(shortLinkUrl: string): string {
  return shortLinkUrl.replace(/^https?:\/\//, '')
}

interface CampaignRegionShareProps {
  block: CampaignTreeOf<'CampaignRegionShareBlock'>
}

/**
 * The Share Languages the public selector offers: only those whose linked
 * journey is live-published, in `CampaignRegionLanguage` order. An Unlinked
 * Language is never shown to visitors.
 */
export function shareLanguages(
  region: Pick<CampaignRegion, 'languages'>
): CampaignShareLanguage[] {
  return region.languages
    .filter((language) => language.journeyStatus === JourneyStatus.published)
    .sort((a, b) => a.order - b.order)
}

/**
 * The language the selector opens on: the visitor's Page Language when the
 * region has a journey in it, else the region's first.
 */
export function defaultShareLanguage(
  languages: CampaignShareLanguage[],
  pageLanguageId: string
): CampaignShareLanguage | undefined {
  return (
    languages.find((language) => language.languageId === pageLanguageId) ??
    languages[0]
  )
}

/** The public selector label: the language's autonym from api-languages, else its id. */
export function shareLanguageLabel(language: CampaignShareLanguage): string {
  return language.language.name[0]?.value ?? language.languageId
}

/** A Campaign String's resolved value, empty when the campaign lacks the row. */
export function campaignString(
  campaign: Pick<CampaignPublic, 'strings'>,
  key: CampaignStringKey
): string {
  return campaign.strings.find((string) => string.key === key)?.value ?? ''
}

interface ShareStepProps {
  id: string
  label: string
  help?: string
  children?: ReactNode
}

/** One numbered step of the panel: its Campaign String label, an optional help line, then its control. */
function ShareStep({
  id,
  label,
  help,
  children
}: ShareStepProps): ReactElement {
  return (
    <Stack spacing={1} sx={{ alignItems: 'flex-start' }}>
      {hasText(label) && (
        <Typography
          variant="subtitle1"
          component="p"
          id={id}
          sx={{ color: 'var(--campaign-band-heading)' }}
        >
          {label}
        </Typography>
      )}
      {hasText(help) && (
        <Typography
          variant="body2"
          sx={{ color: 'var(--campaign-band-muted)' }}
        >
          {help}
        </Typography>
      )}
      {children}
    </Stack>
  )
}

/**
 * The Region Share section: title and intro, then the four steps a visitor
 * passes a journey on with. Step one picks a Share Language (only languages
 * with a live-published journey, opening on the visitor's Page Language when
 * the region has a journey in it, else the region's first); step two
 * previews the journey in a phone frame (the root-domain embed route, kept a
 * preview, with an Open affordance to the Share Link); step three copies
 * the Share Link, the short link the QR encodes, with a toast; step four
 * downloads that QR code as a 1024 px PNG. Every label and button text is a
 * Campaign String in the Page Language; the viewer's own chrome (the Open
 * tooltip, the Copied fallback) is i18next. With no linked language the
 * section is title and intro only. Below `md` the panel stacks single column.
 */
export function CampaignRegionShare({
  block
}: CampaignRegionShareProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { campaign, region } = useCampaign()
  const [selectedId, setSelectedId] = useState<string>()
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const languages = region == null ? [] : shareLanguages(region)
  const selected =
    languages.find((language) => language.id === selectedId) ??
    defaultShareLanguage(languages, campaign.languageId)
  const strings = {
    step1: campaignString(campaign, CampaignStringKey.step1),
    step2: campaignString(campaign, CampaignStringKey.step2),
    step2help: campaignString(campaign, CampaignStringKey.step2help),
    step3: campaignString(campaign, CampaignStringKey.step3),
    step4: campaignString(campaign, CampaignStringKey.step4),
    copy: campaignString(campaign, CampaignStringKey.copy),
    copied: campaignString(campaign, CampaignStringKey.copied),
    downloadQr: campaignString(campaign, CampaignStringKey.downloadQr),
    open: campaignString(campaign, CampaignStringKey.open)
  }
  const openLabel = hasText(strings.open) ? strings.open : t('Open')
  const copiedLabel = hasText(strings.copied) ? strings.copied : t('Copied')
  const shortLink = selected?.shortLinkUrl ?? undefined

  function handleChange(event: SelectChangeEvent<string>): void {
    setSelectedId(event.target.value)
  }

  async function handleCopy(): Promise<void> {
    if (shortLink == null) return
    await navigator.clipboard.writeText(shortLink)
    setCopied(true)
  }

  function handleDownload(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault()
    const canvas = canvasRef.current
    if (canvas == null || region == null || selected == null) return
    downloadQrCodePng(canvas, qrCodeFileName(campaign, region, selected))
  }

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading title={block.title} />
      {hasText(block.intro) && (
        <Typography
          variant="body1"
          data-testid="CampaignRegionShareIntro"
          sx={{ color: 'var(--campaign-band-muted)', maxWidth: 720 }}
        >
          {block.intro}
        </Typography>
      )}
      {selected != null && region != null && (
        <Stack
          spacing={4}
          data-testid="CampaignRegionShareLanguages"
          sx={{ alignItems: 'flex-start', width: '100%' }}
        >
          <ShareStep id={`${block.id}-step1`} label={strings.step1}>
            <FormControl sx={{ minWidth: 240 }}>
              <Select<string>
                value={selected.id}
                onChange={handleChange}
                data-testid="CampaignRegionShareSelect"
                inputProps={{
                  'aria-label': hasText(strings.step1)
                    ? strings.step1
                    : undefined,
                  'aria-labelledby': hasText(strings.step1)
                    ? `${block.id}-step1`
                    : undefined
                }}
                sx={{
                  color: 'var(--campaign-band-text)',
                  backgroundColor: 'var(--campaign-band-card)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--campaign-band-border)'
                  }
                }}
              >
                {languages.map((language) => (
                  <MenuItem
                    key={language.id}
                    value={language.id}
                    lang={language.language.bcp47 ?? undefined}
                  >
                    {shareLanguageLabel(language)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ShareStep>
          <Stack
            data-testid="CampaignRegionSharePanel"
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 6 }}
            sx={{
              width: '100%',
              alignItems: { xs: 'stretch', md: 'flex-start' }
            }}
          >
            <ShareStep
              id={`${block.id}-step2`}
              label={strings.step2}
              help={strings.step2help}
            >
              <Stack
                spacing={1.5}
                data-testid="CampaignRegionSharePhone"
                sx={{
                  alignItems: 'center',
                  alignSelf: { xs: 'center', md: 'flex-start' }
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    maxWidth: '100%',
                    aspectRatio: '9 / 18',
                    borderRadius: 7,
                    border: '10px solid var(--campaign-band-heading)',
                    backgroundColor: '#000000',
                    overflow: 'hidden',
                    boxShadow: 6
                  }}
                >
                  {selected.embedUrl != null && (
                    <Box
                      component="iframe"
                      key={selected.id}
                      data-testid="CampaignRegionSharePhoneIframe"
                      src={previewEmbedUrl(selected.embedUrl)}
                      title={selected.title ?? shareLanguageLabel(selected)}
                      sandbox={PREVIEW_IFRAME_SANDBOX}
                      allow={PREVIEW_IFRAME_ALLOW}
                      loading="lazy"
                      sx={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        border: 0,
                        backgroundColor: '#000000'
                      }}
                    />
                  )}
                </Box>
                {shortLink != null && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'center', maxWidth: 300 }}
                  >
                    <Typography
                      variant="body2"
                      data-testid="CampaignRegionShareShortLink"
                      noWrap
                      sx={{ color: 'var(--campaign-band-text)' }}
                    >
                      {displayShortLink(shortLink)}
                    </Typography>
                    <Tooltip title={openLabel}>
                      <IconButton
                        component="a"
                        href={shortLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={openLabel}
                        size="small"
                        sx={{ color: 'var(--campaign-band-accent)' }}
                      >
                        <LinkExternalIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </Stack>
            </ShareStep>
            <Stack spacing={4} sx={{ flexGrow: 1, alignItems: 'flex-start' }}>
              <ShareStep id={`${block.id}-step3`} label={strings.step3}>
                <Button
                  variant="contained"
                  startIcon={<CopyToIcon />}
                  disabled={shortLink == null}
                  onClick={() => {
                    void handleCopy()
                  }}
                  data-testid="CampaignRegionShareCopy"
                  sx={{
                    backgroundColor: 'var(--campaign-band-button)',
                    color: 'var(--campaign-band-button-label)'
                  }}
                >
                  {hasText(strings.copy) ? strings.copy : t('Copy link')}
                </Button>
              </ShareStep>
              <ShareStep id={`${block.id}-step4`} label={strings.step4}>
                <QrCodeCanvas
                  value={shortLink}
                  size={160}
                  canvasRef={canvasRef}
                />
                <Button
                  variant="outlined"
                  startIcon={<Download2Icon />}
                  disabled={shortLink == null}
                  onClick={handleDownload}
                  data-testid="CampaignRegionShareDownload"
                  sx={{
                    color: 'var(--campaign-band-text)',
                    borderColor: 'var(--campaign-band-border)'
                  }}
                >
                  {hasText(strings.downloadQr)
                    ? strings.downloadQr
                    : t('Download QR code')}
                </Button>
              </ShareStep>
            </Stack>
          </Stack>
        </Stack>
      )}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message={copiedLabel}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        data-testid="CampaignRegionShareCopied"
      />
    </CampaignSectionBand>
  )
}
