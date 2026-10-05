import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo } from 'react'

import { bandCssVariables, resolveBand } from '@core/journeys/ui/Campaign'
import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_theme as CampaignTheme
} from '../../../../../__generated__/GetCampaign'
import {
  CampaignChildPlacement,
  TypographyVariant
} from '../../../../../__generated__/globalTypes'

export type CanvasBlock = CampaignTreeBlock<CampaignBlock>

interface CanvasSectionProps {
  block: CanvasBlock
  theme: CampaignTheme
}

interface SectionText {
  eyebrow?: string | null
  title?: string | null
  lede?: string | null
}

function hasText(value: string | null | undefined): value is string {
  return value != null && value.trim() !== ''
}

function sectionText(block: CanvasBlock): SectionText {
  switch (block.__typename) {
    case 'CampaignHeroBlock':
    case 'CampaignJourneyListBlock':
      return { eyebrow: block.eyebrow, title: block.title, lede: block.lede }
    case 'CampaignVideoCarouselBlock':
    case 'CampaignAnalyticsBlock':
      return { eyebrow: block.eyebrow, title: block.title }
    case 'CampaignRegionSwitcherBlock':
      return { title: block.title }
    case 'CampaignRegionShareBlock':
      return { title: block.title, lede: block.intro }
    case 'CampaignRegionHeaderBlock':
      return { lede: block.intro }
    default:
      return {}
  }
}

function isAbove(child: CanvasBlock): boolean {
  return (
    (child.__typename === 'CampaignTypographyBlock' ||
      child.__typename === 'CampaignButtonBlock') &&
    child.placement === CampaignChildPlacement.above
  )
}

function CanvasExtra({ block }: { block: CanvasBlock }): ReactElement | null {
  switch (block.__typename) {
    case 'CampaignTypographyBlock':
      if (!hasText(block.content)) return null
      return (
        <Typography
          variant={block.typographyVariant ?? TypographyVariant.body1}
          variantMapping={{ overline: 'p', caption: 'p' }}
          align={block.align ?? undefined}
          data-testid="CanvasTypography"
          sx={{
            color: block.color ?? 'var(--campaign-band-text)',
            whiteSpace: 'pre-line',
            wordBreak: 'break-word'
          }}
        >
          {block.content}
        </Typography>
      )
    case 'CampaignButtonBlock':
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent:
              block.align === 'center'
                ? 'center'
                : block.align === 'right'
                  ? 'flex-end'
                  : block.align === 'left'
                    ? 'flex-start'
                    : 'inherit'
          }}
        >
          <Button
            variant={block.buttonVariant ?? 'contained'}
            size={block.size ?? 'medium'}
            data-testid="CanvasButton"
            tabIndex={-1}
            sx={{
              pointerEvents: 'none',
              bgcolor:
                (block.buttonVariant ?? 'contained') === 'contained'
                  ? (block.color ?? 'var(--campaign-band-button)')
                  : undefined,
              color:
                (block.buttonVariant ?? 'contained') === 'contained'
                  ? (block.labelColor ?? 'var(--campaign-band-button-label)')
                  : (block.color ?? 'var(--campaign-band-button)'),
              borderColor: block.color ?? 'var(--campaign-band-button)'
            }}
          >
            {block.label}
          </Button>
        </Box>
      )
    default:
      return null
  }
}

/**
 * The editor canvas's own read-only rendering of one section: the band from
 * the shared resolution table, the Extras placed above, the section text,
 * then the Extras placed below. Inline editing arrives with the text ticket.
 */
export function CanvasSection({
  block,
  theme
}: CanvasSectionProps): ReactElement | null {
  const band = useMemo(() => {
    if (
      block.__typename === 'CampaignTypographyBlock' ||
      block.__typename === 'CampaignButtonBlock'
    )
      return null
    return resolveBand(block, theme)
  }, [block, theme])
  if (band == null) return null

  const text = sectionText(block)
  const align = 'align' in block ? block.align : null
  const titleVariant = block.__typename === 'CampaignHeroBlock' ? 'h1' : 'h2'
  const above = block.children.filter(isAbove)
  const below = block.children.filter((child) => !isAbove(child))
  const alignItems =
    align === 'center'
      ? 'center'
      : align === 'right'
        ? 'flex-end'
        : 'flex-start'

  return (
    <Box
      component="section"
      id={block.id}
      data-testid={`CanvasSection-${block.id}`}
      style={bandCssVariables(band)}
      sx={{
        backgroundColor: 'var(--campaign-band-background)',
        color: 'var(--campaign-band-text)',
        textAlign: align ?? undefined,
        py: { xs: 6, md: 10 }
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3} sx={{ alignItems }}>
          {above.map((child) => (
            <CanvasExtra key={child.id} block={child} />
          ))}
          {hasText(text.eyebrow) && (
            <Typography
              variant="overline"
              component="p"
              data-testid="CanvasEyebrow"
              sx={{ color: 'var(--campaign-band-eyebrow)' }}
            >
              {text.eyebrow}
            </Typography>
          )}
          {hasText(text.title) && (
            <Typography
              variant={titleVariant}
              data-testid="CanvasTitle"
              sx={{ color: 'var(--campaign-band-heading)' }}
            >
              {text.title}
            </Typography>
          )}
          {hasText(text.lede) && (
            <Typography
              variant="body1"
              data-testid="CanvasLede"
              sx={{ color: 'var(--campaign-band-muted)', maxWidth: 720 }}
            >
              {text.lede}
            </Typography>
          )}
          {below.map((child) => (
            <CanvasExtra key={child.id} block={child} />
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
