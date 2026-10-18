import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'

import {
  CampaignCarouselArrows,
  carouselCards,
  useCarouselScroll
} from '@core/journeys/ui/Campaign'
import type { CampaignCarouselCard } from '@core/journeys/ui/Campaign'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { blockLabel } from '../../blockLabel'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import type { CanvasBlock } from '../CanvasSection'
import { HOVER_OUTLINE_SX } from '../hoverOutline'
import { SelectionBadge } from '../SelectionBadge'

const adminPrimary = adminTheme.palette.primary as SimplePaletteColorOptions

interface CanvasCarouselProps {
  block: Extract<CanvasBlock, { __typename: 'CampaignVideoCarouselBlock' }>
}

/**
 * A Video Carousel's cards on the editor canvas, as the public page lays
 * them out: the Watch expansion of `videoId` (the Video's first 12 children
 * then "See all on Watch", or the Video itself), or the explicit items. An
 * explicit item's card selects it for the card bar (Edit, ← →, bin); the
 * expanded cards belong to the section. A dashed placeholder points at Edit
 * while there is nothing to show. From `md` up the row has the same previous /
 * next arrows as the public page; they only scroll, they never edit.
 */
export function CanvasCarousel({ block }: CanvasCarouselProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, selection, selectBlock } = useCampaignEditor()
  const cards = carouselCards(block, campaign.defaultLanguageId)
  const explicit = block.videoId == null
  const { rowRef, ...scroll } = useCarouselScroll(cards.length)

  if (cards.length === 0)
    return (
      <Box
        data-testid="CanvasCarouselPlaceholder"
        sx={{
          width: '100%',
          py: 6,
          border: '1px dashed var(--campaign-band-border)',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--campaign-band-muted)'
        }}
      >
        <Typography variant="body2">{t('Add videos from Edit')}</Typography>
      </Box>
    )

  function handleSelect(event: MouseEvent<HTMLElement>, id: string): void {
    if (!explicit) return
    event.stopPropagation()
    selectBlock(id)
  }

  function renderCard(card: CampaignCarouselCard): ReactElement {
    const selected = explicit && selection.block?.id === card.id
    return (
      <Box
        key={card.id}
        id={explicit ? card.id : undefined}
        data-testid={`CanvasCarouselCard-${card.id}`}
        data-selected={selected}
        data-hoverable={explicit ? '' : undefined}
        onClick={(event: MouseEvent<HTMLElement>) =>
          handleSelect(event, card.id)
        }
        sx={{
          position: 'relative',
          flex: '0 0 auto',
          width: 220,
          overflow: 'hidden',
          borderRadius: 1,
          backgroundColor: 'var(--campaign-band-card)',
          border: '1px solid var(--campaign-band-border)',
          cursor: 'pointer',
          ...(explicit ? HOVER_OUTLINE_SX : {}),
          ...(selected
            ? { outline: `2px solid ${adminPrimary.main}`, outlineOffset: -2 }
            : {})
        }}
      >
        <SelectionBadge
          id={explicit ? card.id : undefined}
          label={blockLabel(t, 'CampaignVideoBlock')}
          selected={selected}
          placement="inside"
        />
        {card.kind === 'seeAll' ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 160,
              p: 2
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: 'var(--campaign-band-heading)' }}
            >
              {t('See all on Watch')}
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                position: 'relative',
                aspectRatio: '16 / 9',
                backgroundColor: 'var(--campaign-band-border)'
              }}
            >
              {card.poster != null && (
                <Box
                  component="img"
                  src={card.poster}
                  alt=""
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}
              {card.childrenCount === 0 &&
                card.duration != null &&
                card.duration > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      right: 6,
                      bottom: 6,
                      px: 0.5,
                      borderRadius: 0.5,
                      color: 'common.white',
                      bgcolor: 'rgba(0, 0, 0, 0.75)'
                    }}
                  >
                    {secondsToTimeFormat(card.duration, { trimZeroes: true })}
                  </Typography>
                )}
            </Box>
            <Stack spacing={0.5} sx={{ p: 1.5 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ color: 'var(--campaign-band-heading)' }}
              >
                {card.title ?? t('Video')}
              </Typography>
              {card.childrenCount > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: 'var(--campaign-band-muted)' }}
                >
                  {t('{{count}} videos', { count: card.childrenCount })}
                </Typography>
              )}
            </Stack>
          </>
        )}
      </Box>
    )
  }

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <CampaignCarouselArrows
        canScrollPrevious={scroll.canScrollPrevious}
        canScrollNext={scroll.canScrollNext}
        onPrevious={scroll.scrollPrevious}
        onNext={scroll.scrollNext}
      />
      <Stack
        ref={rowRef}
        direction="row"
        spacing={2}
        data-testid={`CanvasCarousel-${block.id}`}
        sx={{ width: '100%', overflowX: 'auto', pb: 1 }}
      >
        {cards.map(renderCard)}
      </Stack>
    </Stack>
  )
}
