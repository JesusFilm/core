import sortBy from 'lodash/sortBy'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { lockCampaignStructure, touchCampaign } from '../../campaignWrite'
import { badUserInput, notFound } from '../../errors'
import { BLOCK_CAP_ERROR } from '../../validation'
import { CampaignVideoBlock } from '../campaignVideoBlock'
import {
  assertCampaignBlockRoom,
  assertParentStillLive,
  authorizeTypedBlockUpdate,
  getSiblings
} from '../service'

import {
  PLAYLIST_URL_ERROR,
  fetchYouTubePlaylistVideos,
  parsePlaylistUrl
} from './youTubePlaylist'

builder.mutationField('campaignVideoCarouselBlockPlaylistImport', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [CampaignVideoBlock],
    nullable: false,
    description:
      'Import the first 12 videos of a YouTube playlist into a Video Carousel as explicit CampaignVideoBlock items, appended after its children in playlist order, in one bulk create. Each item is a `youTube` video with the title, description, poster and duration the Data API returns, captured once as for a single YouTube pick. The carousel’s `videoId` is left alone: the items show once it is null. Returns the created items.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `url`): "That link isn\'t a YouTube playlist", "playlist cannot be found on YouTube" for a playlist unknown to YouTube, "That playlist has no videos" for a playlist with no entries, or "That playlist has no public videos" when every entry is private or deleted.\n- INTERNAL_SERVER_ERROR: the YouTube request failed, timed out or answered with no usable body.\n' +
      BLOCK_CAP_ERROR,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      url: t.arg({
        type: 'String',
        required: true,
        description: 'A `youtube.com/playlist?list=<id>` address.'
      })
    },
    resolve: async (_parent, { id, url }, context) => {
      const carousel = await authorizeTypedBlockUpdate(
        String(id),
        context.user,
        'CampaignVideoCarouselBlock'
      )
      const playlistId = parsePlaylistUrl(url)
      if (playlistId == null) throw badUserInput(PLAYLIST_URL_ERROR, 'url')
      const videos = await fetchYouTubePlaylistVideos(playlistId)
      if (videos.length === 0)
        throw badUserInput('That playlist has no public videos', 'url')
      return await prisma.$transaction(async (tx) => {
        await lockCampaignStructure(tx, carousel.campaignId)
        await assertParentStillLive(tx, carousel.id, () =>
          notFound('block not found')
        )
        await assertCampaignBlockRoom(tx, carousel.campaignId, videos.length)
        const siblings = await getSiblings(
          { ...carousel, parentBlockId: carousel.id },
          tx
        )
        const created = await tx.campaignBlock.createManyAndReturn({
          data: videos.map((video, index) => ({
            id: uuidv4(),
            typename: 'CampaignVideoBlock',
            campaignId: carousel.campaignId,
            pageId: carousel.pageId,
            regionId: carousel.regionId,
            parentBlockId: carousel.id,
            parentOrder: siblings.length + index,
            source: 'youTube' as const,
            videoId: video.videoId,
            videoVariantLanguageId: null,
            title: video.title,
            description: video.description,
            image: video.image,
            duration: video.duration
          }))
        })
        await touchCampaign(tx, carousel.campaignId)
        return sortBy(created, 'parentOrder')
      })
    }
  })
)
