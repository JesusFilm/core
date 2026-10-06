import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useMemo } from 'react'

import { CampaignStringKey } from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import type {
  CampaignPublicBlockFields_CampaignVideoCarouselBlock_video,
  CampaignPublicBlockFields_CampaignVideoCarouselBlock_video_children
} from '../__generated__/CampaignPublicBlockFields'
import { watchUrl } from '../libs/watchUrl'
import type { CampaignTreeOf } from '../types'
import { hasText } from '../types'

import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'

interface CampaignVideoCarouselProps {
  block: CampaignTreeOf<'CampaignVideoCarouselBlock'>
}

type VideoTitleArray = Array<{
  value: string
  primary: boolean
  language: { id: string }
}>

/** A Watch title in the Page Language, else the primary, else the first. */
function watchTitle(title: VideoTitleArray, languageId: string): string | null {
  const match =
    title.find((candidate) => candidate.language.id === languageId) ??
    title.find((candidate) => candidate.primary) ??
    title[0]
  return match?.value ?? null
}

function watchPoster(
  images: Array<{ mobileCinematicHigh: string | null }>
): string | null {
  const poster = images[0]?.mobileCinematicHigh
  return hasText(poster) ? poster : null
}

/** A Watch video's deep link: its variant slug, else its bare slug. */
function watchHref(
  slug: string | null,
  variantSlug: string | null
): string | null {
  const value = hasText(variantSlug) ? variantSlug : hasText(slug) ? slug : null
  return value == null ? null : watchUrl(value)
}

function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const mm = `${minutes}`.padStart(2, '0')
  const ss = `${secs}`.padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`
}

const CARD_SX = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  overflow: 'hidden',
  borderRadius: 1,
  textAlign: 'left',
  backgroundColor: 'var(--campaign-band-card)',
  border: '1px solid var(--campaign-band-border)'
} as const

function CardPoster({ poster }: { poster: string | null }): ReactElement {
  return (
    <Box sx={{ aspectRatio: '16 / 9', backgroundColor: 'var(--campaign-band-border)' }}>
      {poster != null && (
        <Box
          component="img"
          src={poster}
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
    </Box>
  )
}

function DurationBadge({ seconds }: { seconds: number | null }): ReactElement {
  const duration = formatDuration(seconds)
  if (duration == null) return <></>
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0.5,
        right: 0.5,
        px: 0.75,
        py: 0.25,
        borderRadius: 0.5,
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        lineHeight: 1
      }}
    >
      {duration}
    </Box>
  )
}

interface Card {
  id: string
  href: string
  title: string | null
  poster: string | null
  /** A "12 videos" count for a Watch card, else null. */
  count: string | null
  /** The YouTube "Watch on YouTube" string, else null. */
  platform: string | null
  duration: number | null
}

function CardLink({ card, index }: { card: Card; index: number }): ReactElement {
  return (
    <ButtonBase
      component="a"
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="CampaignVideoCarouselCard"
      sx={CARD_SX}
    >
      <Box sx={{ position: 'relative' }}>
        <CardPoster poster={card.poster} />
        <DurationBadge seconds={card.duration} />
      </Box>
      <Stack spacing={0.5} sx={{ p: 2 }}>
        {card.title != null && (
          <Typography
            variant="subtitle1"
            component="p"
            sx={{ color: 'var(--campaign-band-heading)', fontWeight: 600 }}
          >
            {card.title}
          </Typography>
        )}
        {card.count != null && (
          <Typography
            variant="body2"
            component="p"
            sx={{ color: 'var(--campaign-band-muted)' }}
          >
            {card.count}
          </Typography>
        )}
        {card.platform != null && (
          <Typography
            variant="body2"
            component="p"
            sx={{ color: 'var(--campaign-band-muted)' }}
          >
            {card.platform}
          </Typography>
        )}
      </Stack>
    </ButtonBase>
  )
}

/**
 * A Watch expansion child as a card: its deep link by variant slug, else its
 * slug, its title in the Page Language, its poster, and its variant duration.
 */
function expandedChildCard(
  child: CampaignPublicBlockFields_CampaignVideoCarouselBlock_video_children,
  languageId: string
): Card | null {
  const href = watchHref(child.slug, child.variant?.slug ?? null)
  if (href == null) return null
  return {
    id: child.id,
    href,
    title: watchTitle(child.title, languageId),
    poster: watchPoster(child.images),
    count: null,
    platform: null,
    duration: child.variant?.duration ?? null
  }
}

/** A single (childless) expanded Watch video as its one card. */
function expandedVideoCard(
  watch: CampaignPublicBlockFields_CampaignVideoCarouselBlock_video,
  languageId: string
): Card | null {
  const href = watchHref(watch.slug, null)
  if (href == null) return null
  return {
    id: watch.id,
    href,
    title: watchTitle(watch.title, languageId),
    poster: watchPoster(watch.images),
    count: null,
    platform: null,
    duration: null
  }
}

/** An explicit Campaign Video item as a card, by its federated media source. */
function explicitVideoCard(params: {
  child: CampaignTreeOf<'CampaignVideoBlock'>
  languageId: string
  videos: string
  youtube: string
}): Card | null {
  const { child, languageId, videos, youtube } = params
  const video = child.mediaVideo
  if (video == null) return null
  const explicitTitle = hasText(child.title) ? child.title : null
  const explicitPoster = hasText(child.image) ? child.image : null
  if (video.__typename === 'Video') {
    const title = explicitTitle ?? watchTitle(video.title, languageId)
    const poster = explicitPoster ?? watchPoster(video.images)
    const href = watchHref(video.slug, video.variant?.slug ?? null)
    if (href == null) return null
    return {
      id: child.id,
      href,
      title,
      poster,
      count:
        video.childrenCount > 0 && videos !== ''
          ? `${video.childrenCount} ${videos}`.trim()
          : null,
      platform: null,
      duration: null
    }
  }
  if (video.__typename === 'YouTube') {
    const videoId = video.id
    if (hasText(videoId) == false) return null
    return {
      id: child.id,
      href: `https://www.youtube.com/watch?v=${videoId}`,
      title: explicitTitle,
      poster: explicitPoster,
      count: null,
      platform: youtube !== '' ? youtube : null,
      duration: child.duration
    }
  }
  const playbackId = video.playbackId
  if (hasText(playbackId) == false) return null
  return {
    id: child.id,
    href: `https://www.mux.com/playback/${playbackId}`,
    title: explicitTitle,
    poster: explicitPoster,
    count: null,
    platform: null,
    duration: child.duration
  }
}

/**
 * The carousel's cards. A Watch link expands to its published children — the
 * first 12, then a "See all on Watch" card — in Watch's own order; a video
 * with no children is one card. Explicit children render in their order; a
 * Watch child links to Watch (with its "<n> videos" count), a YouTube or Mux
 * child to its platform. One level deep: the expanded video's children are
 * the cards, never the grandchildren.
 */
export function campaignVideoCarouselCards(params: {
  block: CampaignTreeOf<'CampaignVideoCarouselBlock'>
  languageId: string
  strings: Record<string, string>
}): Card[] {
  const { block, languageId, strings } = params
  const videos = strings[CampaignStringKey.videos] ?? ''
  const seeAllOnWatch = strings[CampaignStringKey.seeAllOnWatch] ?? ''
  const youtube = strings[CampaignStringKey.youtube] ?? ''
  const watch = block.video

  if (watch != null) {
    if (watch.childrenCount > 0) {
      const cards: Card[] = watch.children
        .slice(0, 12)
        .map((child) => expandedChildCard(child, languageId))
        .filter(
          (card): card is Card => card != null
        )
      const href = watchHref(watch.slug, null)
      if (href != null && seeAllOnWatch !== '') {
        cards.push({
          id: `${watch.id}-see-all`,
          href,
          title: seeAllOnWatch,
          poster: null,
          count: null,
          platform: null,
          duration: null
        })
      }
      return cards
    }
    const card = expandedVideoCard(watch, languageId)
    return card == null ? [] : [card]
  }

  return block.children
    .filter((child): child is CampaignTreeOf<'CampaignVideoBlock'> => {
      if (child.__typename !== 'CampaignVideoBlock') return false
      return child.mediaVideo != null
    })
    .map((child) =>
      explicitVideoCard({ child, languageId, videos, youtube })
    )
    .filter((card): card is Card => card != null)
}

/**
 * The Video Carousel: its text, then its cards — the Watch expansion of
 * `video`, or the explicit video children as items.
 */
export function CampaignVideoCarousel({
  block
}: CampaignVideoCarouselProps): ReactElement {
  const { campaign } = useCampaign()
  const cards = useMemo(
    () =>
      campaignVideoCarouselCards({
        block,
        languageId: campaign.languageId,
        strings: Object.fromEntries(
          campaign.strings.map((string) => [string.key, string.value])
        )
      }),
    [block, campaign.languageId, campaign.strings]
  )

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading eyebrow={block.eyebrow} title={block.title} />
      {cards.length > 0 && (
        <Stack
          spacing={2}
          data-testid="CampaignVideoCarouselCards"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          {cards.map((card, index) => (
            <CardLink key={card.id} card={card} index={index} />
          ))}
        </Stack>
      )}
    </CampaignSectionBand>
  )
}
