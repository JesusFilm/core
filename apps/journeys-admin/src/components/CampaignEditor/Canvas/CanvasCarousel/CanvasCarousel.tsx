import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'

import {
  CampaignCarouselArrows,
  carouselCards,
  useCarouselScroll
} from '@core/journeys/ui/Campaign'
import type { CampaignCarouselCard } from '@core/journeys/ui/Campaign'
import { videoCountLabel } from '@core/journeys/ui/Campaign/CampaignVideo'
import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { CampaignStringKey } from '../../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { blockLabel } from '../../utils/blockLabel'
import { campaignStringText } from '../../utils/campaignStringText'
import type { CanvasBlock } from '../canvasBlock'
import { EditorNote } from '../EditorNote'
import { HOVER_OUTLINE_SX, SELECTED_OUTLINE } from '../hoverOutline'
import { SelectionBadge } from '../SelectionBadge'

interface CanvasCarouselProps {
  block: Extract<CanvasBlock, { __typename: 'CampaignVideoCarouselBlock' }>
}

/**
 * A Video Carousel's cards on the editor canvas, as the public page lays
 * them out: the Watch expansion of `videoId` (the Video's first 12 children
 * then "See all on Watch", or the Video itself), or the explicit items. An
 * explicit item's card selects it for the card bar (Edit, ← →, bin); the
 * expanded cards belong to the section. A dashed placeholder points at Settings
 * while there is nothing to show. From `md` up the row has the same previous /
 * next arrows as the public page; they only scroll, they never edit.
 */
export function CanvasCarousel({ block }: CanvasCarouselProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection,
    selectBlock,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const cards = carouselCards(block, campaign.defaultLanguageId)
  const explicit = block.videoId == null
  const { rowRef, ...scroll } = useCarouselScroll(cards.length)
  // The public carousel reads both Campaign Strings with no fallback: a blank one stays blank.
  const seeAllLabel = campaignStringText(
    campaign,
    CampaignStringKey.seeAllOnWatch,
    previewLanguageId,
    ''
  )
  const videosWord = campaignStringText(
    campaign,
    CampaignStringKey.videos,
    previewLanguageId,
    ''
  )

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
        <EditorNote>{t('Add videos in Settings')}</EditorNote>
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
          ...(selected ? SELECTED_OUTLINE : {})
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
              {seeAllLabel}
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
                  {videoCountLabel(card.childrenCount, videosWord, t)}
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
        sx={{
          width: '100%',
          overflowX: 'auto',
          // Reserve the scrollbar's row up front, so the carousel does not grow and shrink as the bar comes and goes.
          scrollbarGutter: 'stable',
          pb: 1
        }}
      >
        {cards.map(renderCard)}
      </Stack>
    </Stack>
  )
}
