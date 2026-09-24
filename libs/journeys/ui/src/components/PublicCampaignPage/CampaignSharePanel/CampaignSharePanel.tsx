import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useEffect, useState } from 'react'

import { CampaignSectionLabel } from '../CampaignSectionLabel'
import {
  CAMPAIGN_ACCENT,
  CAMPAIGN_BORDER,
  CAMPAIGN_SECTION_IDS,
  CAMPAIGN_SURFACE,
  CAMPAIGN_TEXT,
  CAMPAIGN_TEXT_MUTED,
  PublicCampaignShareJourney,
  buildEmbedUrl,
  buildShareUrl,
  shareJourneyLanguageLabel
} from '../campaignTokens'

import { CampaignQrCodeButton } from './CampaignQrCodeButton'

interface CampaignSharePanelProps {
  journeys: ReadonlyArray<PublicCampaignShareJourney>
  publicOrigin: string
  /** Admin preview: no live iframe, controls disabled. */
  decorative?: boolean
}

function Step({
  number,
  children
}: {
  number: number
  children: ReactNode
}): ReactElement {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Typography
        sx={{
          color: CAMPAIGN_ACCENT,
          fontWeight: 800,
          fontSize: '1.25rem',
          lineHeight: 1.4,
          minWidth: 28
        }}
      >
        {number}.
      </Typography>
      <Stack spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        {children}
      </Stack>
    </Stack>
  )
}

/**
 * The four-step "Here's how it works" panel: pick a language (one share
 * journey per language), preview it in a phone-shaped frame, copy the public
 * link, download a QR code.
 */
export function CampaignSharePanel({
  journeys,
  publicOrigin,
  decorative = false
}: CampaignSharePanelProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const [selectedId, setSelectedId] = useState<string>(journeys[0]?.id ?? '')
  const [copied, setCopied] = useState(false)

  // Keep the selection valid as the list changes underneath (admin edits).
  useEffect(() => {
    if (journeys.some((journey) => journey.id === selectedId)) return
    setSelectedId(journeys[0]?.id ?? '')
  }, [journeys, selectedId])

  useEffect(() => {
    if (!copied) return
    const timeout = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  const selected =
    journeys.find((journey) => journey.id === selectedId) ?? journeys[0]
  const shareUrl =
    selected != null ? buildShareUrl(publicOrigin, selected.slug) : ''
  const embedUrl =
    selected != null ? buildEmbedUrl(publicOrigin, selected.slug) : ''
  const hasJourneys = journeys.length > 0

  function handleLanguageChange(event: SelectChangeEvent<string>): void {
    setSelectedId(event.target.value)
  }

  async function handleCopy(): Promise<void> {
    if (shareUrl === '') return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const mutedSx = { color: CAMPAIGN_TEXT_MUTED }
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      color: CAMPAIGN_TEXT,
      backgroundColor: CAMPAIGN_SURFACE,
      '& fieldset': { borderColor: CAMPAIGN_BORDER }
    },
    '& .MuiInputLabel-root': mutedSx
  }

  return (
    <Box
      component="section"
      id={CAMPAIGN_SECTION_IDS.share}
      data-testid="CampaignSharePanel"
      sx={{ scrollMarginTop: 24 }}
    >
      <CampaignSectionLabel>{t('Share')}</CampaignSectionLabel>
      <Typography
        component="h2"
        sx={{
          color: CAMPAIGN_TEXT,
          fontWeight: 800,
          fontSize: decorative ? '1.5rem' : { xs: '1.75rem', md: '2.25rem' },
          mb: 4
        }}
      >
        {t("Here's how it works")}
      </Typography>
      <Stack
        direction={decorative ? 'column' : { xs: 'column', md: 'row' }}
        spacing={decorative ? 4 : { xs: 5, md: 8 }}
        sx={{ alignItems: 'flex-start' }}
      >
        <Stack spacing={4} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Step number={1}>
            <Typography sx={mutedSx}>
              {t(
                'Pick a language your friend, family member, or neighbor understands.'
              )}
            </Typography>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel id={`${CAMPAIGN_SECTION_IDS.share}-language-label`}>
                {t('Language')}
              </InputLabel>
              <Select
                labelId={`${CAMPAIGN_SECTION_IDS.share}-language-label`}
                label={t('Language')}
                value={selected?.id ?? ''}
                onChange={handleLanguageChange}
                disabled={decorative || !hasJourneys}
                data-testid="CampaignLanguageSelect"
              >
                {journeys.map((journey) => (
                  <MenuItem key={journey.id} value={journey.id}>
                    {shareJourneyLanguageLabel(journey)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!hasJourneys && (
              <Typography variant="body2" sx={mutedSx}>
                {t('Journeys added to this campaign will appear here.')}
              </Typography>
            )}
          </Step>
          <Step number={2}>
            <Typography sx={mutedSx}>
              {t("Watch what they'll experience before you send it.")}
            </Typography>
          </Step>
          <Step number={3}>
            <Typography sx={mutedSx}>
              {t('Share this link with them.')}
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                value={shareUrl}
                slotProps={{
                  input: { readOnly: true },
                  htmlInput: { 'aria-label': t('Share link') }
                }}
                sx={fieldSx}
              />
              <Button
                variant="contained"
                onClick={handleCopy}
                disabled={decorative || shareUrl === ''}
                data-testid="CampaignCopyLinkButton"
                sx={{
                  flexShrink: 0,
                  backgroundColor: CAMPAIGN_ACCENT,
                  '&:hover': { backgroundColor: CAMPAIGN_ACCENT, opacity: 0.9 }
                }}
              >
                {copied ? t('Copied') : t('Copy')}
              </Button>
            </Stack>
          </Step>
          <Step number={4}>
            <Typography sx={mutedSx}>
              {t(
                'Download a QR code if you want one for print or in-person sharing.'
              )}
            </Typography>
            <CampaignQrCodeButton
              value={shareUrl}
              fileName={selected?.slug ?? 'campaign'}
              decorative={decorative}
            />
          </Step>
        </Stack>
        <Stack
          spacing={1.5}
          sx={{
            alignItems: 'center',
            width: '100%',
            maxWidth: decorative ? 220 : 340,
            alignSelf: decorative ? 'center' : undefined,
            mx: 'auto'
          }}
        >
          <Typography
            variant="overline"
            sx={{ ...mutedSx, letterSpacing: '0.2em', fontWeight: 700 }}
          >
            {t('Interactive preview')}
          </Typography>
          <Box
            data-testid="CampaignJourneyFrame"
            sx={{
              width: '100%',
              aspectRatio: '9 / 16',
              borderRadius: 6,
              overflow: 'hidden',
              border: `1px solid ${CAMPAIGN_BORDER}`,
              backgroundColor: CAMPAIGN_SURFACE,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!decorative && selected != null ? (
              <Box
                component="iframe"
                key={selected.id}
                src={embedUrl}
                title={t('Preview of {{title}}', { title: selected.title })}
                allow="autoplay; encrypted-media; fullscreen"
                sx={{ border: 0, width: '100%', height: '100%' }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ ...mutedSx, px: 3, textAlign: 'center' }}
              >
                {selected != null
                  ? t('The selected journey plays here on the live page.')
                  : t('Add a journey to preview it here.')}
              </Typography>
            )}
          </Box>
        </Stack>
      </Stack>
    </Box>
  )
}
