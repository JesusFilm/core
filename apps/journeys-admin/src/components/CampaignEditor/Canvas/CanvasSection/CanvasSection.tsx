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
  /** The preview language id: resolves each text field's `*Translations`; null keeps the default-language value. */
  previewLanguageId: string | null
}

interface SectionText {
  eyebrow?: string | null
  title?: string | null
  lede?: string | null
}

function hasText(value: string | null | undefined): value is string {
  return value != null && value.trim() !== ''
}

type TranslationValue = { languageId: string; value: string }

/** The preview-language value of a Translated Field; the default-language value stands in while there is none. */
function translatedValue(
  defaultValue: string | null | undefined,
  translations: readonly TranslationValue[],
  languageId: string | null
): string | null | undefined {
  if (languageId == null) return defaultValue
  return (
    translations.find((entry) => entry.languageId === languageId)?.value ??
    defaultValue
  )
}

function sectionText(
  block: CanvasBlock,
  previewLanguageId: string | null
): SectionText {
  switch (block.__typename) {
    case 'CampaignHeroBlock':
      return {
        eyebrow: translatedValue(
          block.eyebrow,
          block.eyebrowTranslations,
          previewLanguageId
        ),
        title: translatedValue(
          block.title,
          block.titleTranslations,
          previewLanguageId
        ),
        lede: translatedValue(
          block.lede,
          block.ledeTranslations,
          previewLanguageId
        )
      }
    case 'CampaignJourneyListBlock':
      return {
        eyebrow: translatedValue(
          block.eyebrow,
          block.eyebrowTranslations,
          previewLanguageId
        ),
        title: translatedValue(
          block.title,
          block.titleTranslations,
          previewLanguageId
        ),
        lede: translatedValue(
          block.lede,
          block.ledeTranslations,
          previewLanguageId
        )
      }
    case 'CampaignVideoCarouselBlock':
      return {
        eyebrow: translatedValue(
          block.eyebrow,
          block.eyebrowTranslations,
          previewLanguageId
        ),
        title: translatedValue(
          block.title,
          block.titleTranslations,
          previewLanguageId
        )
      }
    case 'CampaignAnalyticsBlock':
      return {
        eyebrow: translatedValue(
          block.eyebrow,
          block.eyebrowTranslations,
          previewLanguageId
        ),
        title: translatedValue(
          block.title,
          block.titleTranslations,
          previewLanguageId
        )
      }
    case 'CampaignRegionSwitcherBlock':
      return {
        title: translatedValue(
          block.title,
          block.titleTranslations,
          previewLanguageId
        )
      }
    case 'CampaignRegionShareBlock':
      return {
        title: translatedValue(
          block.title,
          block.titleTranslations,
          previewLanguageId
        ),
        lede: translatedValue(
          block.intro,
          block.introTranslations,
          previewLanguageId
        )
      }
    case 'CampaignRegionHeaderBlock':
      return {
        lede: translatedValue(
          block.intro,
          block.introTranslations,
          previewLanguageId
        )
      }
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

function CanvasExtra({
  block,
  previewLanguageId
}: {
  block: CanvasBlock
  previewLanguageId: string | null
}): ReactElement | null {
  switch (block.__typename) {
    case 'CampaignTypographyBlock': {
      const content = translatedValue(
        block.content,
        block.contentTranslations,
        previewLanguageId
      )
      if (!hasText(content)) return null
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
          {content}
        </Typography>
      )
    }
    case 'CampaignButtonBlock': {
      const label = translatedValue(
        block.label,
        block.labelTranslations,
        previewLanguageId
      )
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
            {label}
          </Button>
        </Box>
      )
    }
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
  theme,
  previewLanguageId
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

  const text = sectionText(block, previewLanguageId)
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
            <CanvasExtra
              key={child.id}
              block={child}
              previewLanguageId={previewLanguageId}
            />
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
            <CanvasExtra
              key={child.id}
              block={child}
              previewLanguageId={previewLanguageId}
            />
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
