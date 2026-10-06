import { VideoBlockSource } from '../../../../__generated__/globalTypes'
import type {
  CampaignPublicBlockFields_CampaignVideoCarouselBlock_video_children as ExpandedChild,
  CampaignPublicBlockFields_CampaignVideoCarouselBlock_video as ExpandedVideo
} from '../__generated__/CampaignPublicBlockFields'
import {
  campaignVideoDetails,
  watchTitle
} from '../CampaignVideo/campaignVideoDetails'
import { watchUrl } from '../libs/watchUrl'
import { hasText } from '../types'
import type { CampaignTree, CampaignTreeOf } from '../types'

/** Watch expansion shows this many of the Video's children, then "See all on Watch". */
export const WATCH_EXPANSION_LIMIT = 12

type CampaignVideoItem = CampaignTreeOf<'CampaignVideoBlock'>

export interface CampaignCarouselVideoCard {
  kind: 'video'
  id: string
  source: 'watch' | 'youTube' | 'mux'
  title: string | null
  poster: string | null
  /** Seconds, for the duration badge; null when unknown. */
  duration: number | null
  /** A container's published children: the card reads "<n> videos" and links to it on Watch. */
  childrenCount: number
  /** Where the card opens: the Watch page or the YouTube video. */
  href: string | null
  /** An uploaded (Mux) item, played in place: it has no page to open. */
  block: CampaignVideoItem | null
}

export interface CampaignCarouselSeeAllCard {
  kind: 'seeAll'
  id: string
  href: string
}

export type CampaignCarouselCard =
  | CampaignCarouselVideoCard
  | CampaignCarouselSeeAllCard

function watchHref(video: ExpandedVideo | ExpandedChild): string | null {
  const slug = video.variant?.slug ?? video.slug
  return hasText(slug) ? watchUrl(slug) : null
}

function watchCard(
  video: ExpandedVideo | ExpandedChild,
  languageId: string
): CampaignCarouselVideoCard {
  return {
    kind: 'video',
    id: video.id,
    source: 'watch',
    title: watchTitle(video.title, languageId),
    poster: video.images[0]?.mobileCinematicHigh ?? null,
    duration: video.variant?.duration ?? null,
    childrenCount: video.childrenCount,
    href: watchHref(video),
    block: null
  }
}

function isVideoItem(child: CampaignTree): child is CampaignVideoItem {
  return child.__typename === 'CampaignVideoBlock'
}

function itemCard(
  item: CampaignVideoItem,
  languageId: string
): CampaignCarouselVideoCard | null {
  const details = campaignVideoDetails(item, languageId)
  switch (item.source) {
    case VideoBlockSource.youTube:
      if (item.videoId == null) return null
      return {
        kind: 'video',
        id: item.id,
        source: 'youTube',
        title: details.title,
        poster: details.poster,
        duration: item.duration,
        childrenCount: 0,
        href: `https://www.youtube.com/watch?v=${encodeURIComponent(item.videoId)}`,
        block: null
      }
    case VideoBlockSource.mux:
      if (item.mediaVideo == null) return null
      return {
        kind: 'video',
        id: item.id,
        source: 'mux',
        title: details.title,
        poster: details.poster,
        duration: item.duration,
        childrenCount: 0,
        href: null,
        block: item
      }
    default: {
      // A Watch item the gateway no longer serves (unpublished) is left out.
      const video =
        item.mediaVideo?.__typename === 'Video' ? item.mediaVideo : null
      if (video == null) return null
      return {
        kind: 'video',
        id: item.id,
        source: 'watch',
        title: details.title,
        poster: details.poster,
        duration: video.variant?.duration ?? null,
        childrenCount: details.childrenCount,
        href: details.watchHref,
        block: null
      }
    }
  }
}

/**
 * The cards a Video Carousel shows. Its nullable `videoId` is the mode.
 * Watch expansion follows the Video tree, not its label: a Video with
 * published children shows them in Watch's order, the first 12 then a
 * "See all on Watch" card; one with none (or none the gateway serves) is
 * that one Video as a single card. One level only — a child that is itself
 * a container is a card linking to it on Watch. Explicit mode shows the
 * CampaignVideoBlock children by `parentOrder`.
 */
export function carouselCards(
  block: CampaignTreeOf<'CampaignVideoCarouselBlock'>,
  languageId: string
): CampaignCarouselCard[] {
  if (block.videoId != null) {
    const video = block.video
    if (video == null) return []
    if (video.childrenCount === 0 || video.children.length === 0)
      return [watchCard(video, languageId)]
    const cards: CampaignCarouselCard[] = video.children
      .slice(0, WATCH_EXPANSION_LIMIT)
      .map((child) => watchCard(child, languageId))
    const href = watchHref(video)
    if (href != null)
      cards.push({ kind: 'seeAll', id: `${video.id}-seeAll`, href })
    return cards
  }
  return block.children
    .filter(isVideoItem)
    .map((item) => itemCard(item, languageId))
    .filter((card): card is CampaignCarouselVideoCard => card != null)
}

/** Whether a carousel has any card to show; the language only picks titles. */
export function hasCarouselCards(
  block: CampaignTreeOf<'CampaignVideoCarouselBlock'>
): boolean {
  return carouselCards(block, '').length > 0
}
