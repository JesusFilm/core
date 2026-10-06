import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { env } from '../../../../env'
import { fetchFieldsFromYouTube } from '../../../block/video/service'

import { builder } from '../../../builder'
import {
  Action,
  campaignAcl,
  INCLUDE_CAMPAIGN_ACL
} from '../../campaign.acl'
import {
  CampaignBlockWithAction,
  CAMPAIGN_VIDEO_ITEM_OWNER_TYPENAMES,
  CAMPAIGN_VIDEO_TYPENAME,
  touchCampaign
} from '../service'
import { CampaignVideoBlock } from '../campaignVideoBlock'

/** How many of a pasted playlist's videos the import takes (PRD §15). */
export const PLAYLIST_IMPORT_LIMIT = 12

export const YOUTUBE_PLAYLIST_ERROR = "That link isn't a YouTube playlist"

/**
 * The Data API playlist id of a pasted address: `youtube.com/playlist?list=`,
 * `youtu.be/playlist?list=` or a `youtube.com/embed/<videoId>?list=` link.
 * `null` for anything else — a bare video link and every non-YouTube host.
 */
export function parseYouTubePlaylistUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url.trim())
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
  const segments = parsed.pathname
    .split('/')
    .filter((segment) => segment !== '')
    .map((segment) => {
      try {
        return decodeURIComponent(segment)
      } catch {
        return segment
      }
    })
  if (
    parsed.hostname !== 'youtube.com' &&
    parsed.hostname !== 'www.youtube.com' &&
    parsed.hostname !== 'm.youtube.com' &&
    parsed.hostname !== 'youtu.be'
  )
    return null
  const inPlaylist = segments[0] === 'playlist'
  const inEmbed = segments[0] === 'embed' && segments.length === 2
  if (!inPlaylist && !inEmbed) return null
  const playlistId = parsed.searchParams.get('list')
  return playlistId != null && playlistId !== '' ? playlistId : null
}

interface PlaylistItem {
  videoId: string
  title: string
  image: string
}

/**
 * A playlist's first items through the Data API's `playlistItems` (its own
 * order, `maxResults` capped at the import limit): an unknown or empty
 * playlist answers `items: []`, a failed request (quota, key) throws. The
 * items carry each video id, title and poster.
 */
export async function fetchYouTubePlaylistItems(
  playlistId: string
): Promise<PlaylistItem[]> {
  const query = new URLSearchParams({
    part: 'snippet,contentDetails',
    key: env.FIREBASE_API_KEY,
    playlistId,
    maxResults: String(PLAYLIST_IMPORT_LIMIT)
  }).toString()
  const data: {
    error?: { code: number; message: string }
    items?: Array<{
      snippet: { title: string; thumbnails: { high?: { url: string } } }
      contentDetails: { videoId: string }
    }>
  } = await (
    await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${query}`)
  ).json()
  if (data.error != null)
    throw new GraphQLError(
      `YouTube API request failed: ${data.error.message}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } }
    )
  // `maxResults` asks the Data API for at most the limit; slicing caps the
  // import on the client side too, in case more arrive.
  return (data.items ?? [])
    .slice(0, PLAYLIST_IMPORT_LIMIT)
    .map((item) => ({
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      image: item.snippet.thumbnails.high?.url ?? ''
    }))
}

/**
 * Import a pasted YouTube playlist into a carousel: its first
 * `PLAYLIST_IMPORT_LIMIT` videos become explicit `CampaignVideoBlock`
 * children, each with the fields fetched from the Data API, created in one
 * bulk write at `parentOrder` 0 and up — and the carousel's Watch expansion
 * is cleared so the items are what it holds. The carousel's text and style
 * are untouched.
 */
export async function importPlaylistIntoCarousel(
  carouselId: string,
  playlistId: string,
  user: User
): Promise<CampaignBlockWithAction[]> {
  const carousel = await prisma.campaignBlock.findFirst({
    where: {
      id: carouselId,
      typename: CAMPAIGN_VIDEO_ITEM_OWNER_TYPENAMES[0],
      deletedAt: null
    },
    include: { campaign: { include: INCLUDE_CAMPAIGN_ACL } }
  })
  if (carousel == null)
    throw new GraphQLError('block not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  if (!campaignAcl(Action.Update, carousel.campaign, user))
    throw new GraphQLError('user is not allowed to update block', {
      extensions: { code: 'FORBIDDEN' }
    })
  const items = await fetchYouTubePlaylistItems(playlistId)
  if (items.length === 0)
    throw new GraphQLError('The playlist has no videos to import', {
      extensions: { code: 'NOT_FOUND', field: 'url' }
    })
  // Each imported item keeps the fields the YouTube Data API reports for its
  // video, fetched per id the way a single picked video is.
  const fields = await Promise.all(
    items.map(async (item) => await fetchFieldsFromYouTube(item.videoId))
  )
  const rows: Array<Prisma.CampaignBlockCreateManyInput> = items.map(
    (item, parentOrder) => ({
      id: uuidv4(),
      typename: CAMPAIGN_VIDEO_TYPENAME,
      campaignId: carousel.campaignId,
      pageId: carousel.pageId,
      regionId: carousel.regionId,
      parentBlockId: carousel.id,
      parentOrder,
      source: 'youTube',
      videoId: item.videoId,
      title: fields[parentOrder].title,
      description: fields[parentOrder].description,
      image: fields[parentOrder].image,
      duration: fields[parentOrder].duration
    })
  )
  const created = await prisma.$transaction(async (tx) => {
    await tx.campaignBlock.createMany({ data: rows })
    await tx.campaignBlock.update({
      where: { id: carousel.id },
      data: { videoId: null, videoVariantLanguageId: null }
    })
    await touchCampaign(tx, carousel.campaignId)
    return await tx.campaignBlock.findMany({
      where: {
        campaignId: carousel.campaignId,
        parentBlockId: carousel.id,
        typename: CAMPAIGN_VIDEO_TYPENAME,
        deletedAt: null
      },
      orderBy: { parentOrder: 'asc' },
      include: { action: true }
    })
  })
  return created
}

builder.mutationField('campaignVideoCarouselBlockPlaylistImport', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignVideoBlock],
    nullable: false,
    description:
      'Import a pasted YouTube playlist into a video carousel: the playlist’s first 12 videos become explicit items, each a CampaignVideoBlock child with the fields fetched from the Data API, created in one bulk write, and the carousel’s Watch expansion is cleared so the items are what it holds.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock; a playlist with no videos (field: `url`).\n- FORBIDDEN: caller is not in the team.',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      url: t.arg({
        type: 'String',
        required: true,
        description: 'A YouTube playlist address.'
      })
    },
    resolve: async (_parent, { id, url }, context) =>
      await importPlaylistIntoCarousel(
        String(id),
        parsePlaylist(url),
        context.user
      )
  })
)

function parsePlaylist(url: string): string {
  const playlistId = parseYouTubePlaylistUrl(url)
  if (playlistId == null)
    throw new GraphQLError(YOUTUBE_PLAYLIST_ERROR, {
      extensions: { code: 'NOT_FOUND', field: 'url' }
    })
  return playlistId
}
