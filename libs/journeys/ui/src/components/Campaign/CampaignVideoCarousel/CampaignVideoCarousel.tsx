import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, useMemo, useState } from 'react'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { CampaignVideo } from '../CampaignVideo'
import type { CampaignTreeOf } from '../types'

import {
  CampaignCarouselSeeAllCard,
  CampaignCarouselVideoCard,
  carouselCards
} from './carouselCards'

interface CampaignVideoCarouselProps {
  block: CampaignTreeOf<'CampaignVideoCarouselBlock'>
}

const CARD_WIDTH = { xs: 260, md: 300 }

const cardSx = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  flex: '0 0 auto',
  width: CARD_WIDTH,
  overflow: 'hidden',
  borderRadius: 1,
  textAlign: 'left',
  scrollSnapAlign: 'start',
  backgroundColor: 'var(--campaign-band-card)',
  border: '1px solid var(--campaign-band-border)'
} as const

interface CardFrameProps {
  testId: string
  href?: string | null
  onClick?: () => void
  children: ReactNode
}

/** A card opens its page in a new tab, or (an upload) plays in place. */
function CardFrame({
  testId,
  href,
  onClick,
  children
}: CardFrameProps): ReactElement {
  if (href != null)
    return (
      <ButtonBase
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testId}
        sx={cardSx}
      >
        {children}
      </ButtonBase>
    )
  return (
    <ButtonBase
      onClick={onClick}
      disabled={onClick == null}
      data-testid={testId}
      sx={cardSx}
    >
      {children}
    </ButtonBase>
  )
}

function VideoCard({
  card,
  onPlay
}: {
  card: CampaignCarouselVideoCard
  onPlay: (card: CampaignCarouselVideoCard) => void
}): ReactElement {
  const { campaign } = useCampaign()
  const string = (key: CampaignStringKey): string =>
    campaign.strings.find((candidate) => candidate.key === key)?.value ?? ''
  const action =
    card.childrenCount > 0
      ? `${card.childrenCount} ${string(CampaignStringKey.videos)}`.trim()
      : card.source === 'youTube'
        ? string(CampaignStringKey.youtube)
        : string(CampaignStringKey.watch)
  const showDuration =
    card.childrenCount === 0 && card.duration != null && card.duration > 0

  return (
    <CardFrame
      testId={`CampaignVideoCarouselCard-${card.id}`}
      href={card.href}
      onClick={card.block != null ? () => onPlay(card) : undefined}
    >
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
            loading="lazy"
            sx={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}
        {showDuration && (
          <Typography
            variant="caption"
            component="span"
            data-testid="CampaignVideoCarouselCardDuration"
            sx={{
              position: 'absolute',
              right: 8,
              bottom: 8,
              px: 0.75,
              borderRadius: 0.5,
              color: '#fff',
              backgroundColor: 'rgba(0, 0, 0, 0.75)'
            }}
          >
            {secondsToTimeFormat(card.duration ?? 0, { trimZeroes: true })}
          </Typography>
        )}
      </Box>
      <Stack spacing={0.5} sx={{ p: 2, flexGrow: 1 }}>
        {card.title != null && (
          <Typography
            variant="subtitle1"
            component="span"
            sx={{
              color: 'var(--campaign-band-heading)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {card.title}
          </Typography>
        )}
        {action !== '' && (
          <Typography
            variant="body2"
            component="span"
            sx={{ color: 'var(--campaign-band-accent)' }}
          >
            {action}
          </Typography>
        )}
      </Stack>
    </CardFrame>
  )
}

function SeeAllCard({
  card
}: {
  card: CampaignCarouselSeeAllCard
}): ReactElement {
  const { campaign } = useCampaign()
  const label =
    campaign.strings.find(
      (candidate) => candidate.key === CampaignStringKey.seeAllOnWatch
    )?.value ?? ''
  return (
    <CardFrame testId="CampaignVideoCarouselSeeAll" href={card.href}>
      <Box
        sx={{
          display: 'flex',
          flexGrow: 1,
          minHeight: 200,
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Typography
          variant="h6"
          component="span"
          sx={{ color: 'var(--campaign-band-heading)', textAlign: 'center' }}
        >
          {label}
        </Typography>
      </Box>
    </CardFrame>
  )
}

/**
 * The Video Carousel: its text, then a row of video cards that scrolls
 * sideways. Watch expansion of `videoId` shows the Video's children (the
 * gateway's join, in Watch's order), the first 12 then "See all on Watch",
 * or the Video itself when it has none; explicit mode shows the ordered
 * CampaignVideoBlock children. Watch and YouTube cards open the video on
 * its site; an uploaded video plays in a dialog. Every card carries the
 * duration badge, or "<n> videos" for a container.
 */
export function CampaignVideoCarousel({
  block
}: CampaignVideoCarouselProps): ReactElement {
  const { campaign } = useCampaign()
  const cards = useMemo(
    () => carouselCards(block, campaign.languageId),
    [block, campaign.languageId]
  )
  const [playing, setPlaying] = useState<CampaignCarouselVideoCard>()

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading eyebrow={block.eyebrow} title={block.title} />
      {cards.length > 0 && (
        <Stack
          direction="row"
          spacing={3}
          data-testid={`CampaignVideoCarouselCards-${block.id}`}
          sx={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            pb: 1,
            mx: { xs: -2, sm: 0 },
            px: { xs: 2, sm: 0 }
          }}
        >
          {cards.map((card) =>
            card.kind === 'seeAll' ? (
              <SeeAllCard key={card.id} card={card} />
            ) : (
              <VideoCard key={card.id} card={card} onPlay={setPlaying} />
            )
          )}
        </Stack>
      )}
      <Dialog
        open={playing?.block != null}
        onClose={() => setPlaying(undefined)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, backgroundColor: '#000' }}>
          {playing?.block != null && <CampaignVideo block={playing.block} />}
        </DialogContent>
      </Dialog>
    </CampaignSectionBand>
  )
}
