import sortBy from 'lodash/sortBy'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../../builder'
import { badUserInput } from '../../validation'
import { CampaignVideoBlock } from '../campaignVideoBlock'
import {
  CAMPAIGN_CAROUSEL_TYPENAME,
  CAMPAIGN_VIDEO_TYPENAME,
  authorizeTypedBlockUpdate,
  getSiblings,
  touchCampaign
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
      'Import the first 12 videos of a YouTube playlist into a Video Carousel as explicit CampaignVideoBlock items, appended after its children in playlist order, in one bulk create. Each item is a `youTube` video with the title, description, poster and duration the Data API returns, captured once as for a single YouTube pick. The carousel’s `videoId` is left alone: the items show once it is null. Returns the created items.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve to a live CampaignVideoCarouselBlock; the playlist is unknown to YouTube.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `url`): "That link isn\'t a YouTube playlist", or the playlist has no public videos.',
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
        CAMPAIGN_CAROUSEL_TYPENAME
      )
      const playlistId = parsePlaylistUrl(url)
      if (playlistId == null) throw badUserInput(PLAYLIST_URL_ERROR, 'url')
      const videos = await fetchYouTubePlaylistVideos(playlistId)
      if (videos.length === 0)
        throw badUserInput('That playlist has no public videos', 'url')
      return await prisma.$transaction(async (tx) => {
        const siblings = await getSiblings(
          { ...carousel, parentBlockId: carousel.id },
          tx
        )
        const created = await tx.campaignBlock.createManyAndReturn({
          data: videos.map((video, index) => ({
            id: uuidv4(),
            typename: CAMPAIGN_VIDEO_TYPENAME,
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
