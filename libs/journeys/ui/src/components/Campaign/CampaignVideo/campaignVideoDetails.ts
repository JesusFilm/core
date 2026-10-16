import {
  VideoBlockObjectFit,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import type { TreeBlock } from '../../../libs/block'
import type {
  VideoFields,
  VideoFields_mediaVideo
} from '../../Video/__generated__/VideoFields'
import type { CampaignPublicBlockFields_CampaignVideoBlock_mediaVideo_Video as WatchVideo } from '../__generated__/CampaignPublicBlockFields'
import { campaignImageSource } from '../libs/campaignImageSource'
import { watchUrl } from '../libs/watchUrl'
import type { CampaignBlockOf } from '../types'
import { hasText } from '../types'

type CampaignVideoBlock = CampaignBlockOf<'CampaignVideoBlock'>

export interface CampaignVideoDetails {
  title: string | null
  description: string | null
  poster: string | null
  /** The Watch video's published children; zero for YouTube and Mux. */
  childrenCount: number
  /** The Watch page, for a Watch video with a slug. */
  watchHref: string | null
}

function watchVideo(block: CampaignVideoBlock): WatchVideo | null {
  return block.mediaVideo?.__typename === 'Video' ? block.mediaVideo : null
}

/** A Watch title or description as the gateway returns it with `(languageId, primary: true)`. */
export interface WatchText {
  value: string
  primary: boolean
  language: { id: string }
}

/** The Watch text in the Page Language, else the primary, else the first. */
export function watchText(
  texts: WatchText[],
  languageId: string
): string | null {
  const text =
    texts.find((candidate) => candidate.language.id === languageId) ??
    texts.find((candidate) => candidate.primary) ??
    texts[0]
  return text?.value ?? null
}

function watchField(
  texts: WatchText[] | undefined,
  languageId: string
): string | null {
  if (texts == null) return null
  return watchText(texts, languageId)
}

/**
 * What a Campaign Video shows: YouTube and Mux their fields captured at pick;
 * a Watch video its `mediaVideo` in the Page Language, the row's non-empty
 * overrides winning.
 */
export function campaignVideoDetails(
  block: CampaignVideoBlock,
  languageId: string
): CampaignVideoDetails {
  const video = watchVideo(block)
  const slug = video?.variant?.slug ?? video?.slug
  return {
    title: hasText(block.title)
      ? block.title
      : watchField(video?.title, languageId),
    description: hasText(block.description)
      ? block.description
      : watchField(video?.description, languageId),
    poster: campaignImageSource(block)?.src ?? null,
    childrenCount: video?.childrenCount ?? 0,
    watchHref: hasText(slug) ? watchUrl(slug) : null
  }
}

function playerMediaVideo(
  block: CampaignVideoBlock,
  title: string | null
): VideoFields_mediaVideo | null {
  const mediaVideo = block.mediaVideo
  switch (mediaVideo?.__typename) {
    case 'Video':
      return {
        __typename: 'Video',
        id: mediaVideo.id,
        title: [{ __typename: 'VideoTitle', value: title ?? '' }],
        images: mediaVideo.images,
        variant:
          mediaVideo.variant == null
            ? null
            : {
                __typename: 'VideoVariant',
                id: mediaVideo.variant.id,
                hls: mediaVideo.variant.hls
              },
        variantLanguages: []
      }
    case 'MuxVideo':
      return {
        __typename: 'MuxVideo',
        id: mediaVideo.id,
        assetId: null,
        playbackId: mediaVideo.playbackId
      }
    case 'YouTube':
      return { __typename: 'YouTube', id: mediaVideo.id }
    default:
      return null
  }
}

/**
 * The Campaign Video as the journeys `Video` player's block: the same source
 * and federated video, played whole (no trims, triggers, action or events),
 * fitted inside its frame rather than cropped, never autoplaying.
 */
export function campaignVideoPlayerBlock(
  block: CampaignVideoBlock,
  details: CampaignVideoDetails
): TreeBlock<VideoFields> {
  return {
    __typename: 'VideoBlock',
    id: block.id,
    parentBlockId: block.parentBlockId,
    parentOrder: block.parentOrder,
    muted: false,
    autoplay: false,
    startAt: 0,
    endAt: null,
    posterBlockId: null,
    fullsize: null,
    videoId: block.videoId,
    videoVariantLanguageId: block.videoVariantLanguageId,
    source: block.source ?? VideoBlockSource.internal,
    title: details.title,
    description: details.description,
    image: details.poster,
    duration: block.duration,
    objectFit: VideoBlockObjectFit.fit,
    showGeneratedSubtitles: null,
    subtitleLanguage: null,
    mediaVideo: playerMediaVideo(block, details.title),
    action: null,
    eventLabel: null,
    endEventLabel: null,
    customizable: null,
    notes: null,
    children: []
  }
}
