import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignVideoBlockCreate,
  CampaignVideoBlockCreateVariables
} from '../../../__generated__/CampaignVideoBlockCreate'
import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_blocks_CampaignVideoBlock
} from '../../../__generated__/GetCampaign'
import { VideoBlockSource } from '../../../__generated__/globalTypes'
import {
  campaignBlockCreateUpdate,
  campaignBlockSlotWrite
} from '../campaignBlockCache'

export type CampaignVideoBlock = GetCampaign_campaign_blocks_CampaignVideoBlock

export const CAMPAIGN_VIDEO_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignVideoBlockCreate(
    $input: CampaignVideoBlockCreateInput!
    $languageId: ID
  ) {
    campaignVideoBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

/**
 * What a Media Slot video pick names: a pasted Watch address (the server
 * resolves it through its variant slug), or a YouTube or Mux video id.
 */
export type CampaignVideoPick =
  | { source: VideoBlockSource.internal; url: string }
  | {
      source: VideoBlockSource.youTube | VideoBlockSource.mux
      videoId: string
    }

/** The columns of the hero or Featured Media section whose Media Slot the video fills. */
export type CampaignVideoOwner = Pick<
  CampaignBlock,
  '__typename' | 'id' | 'campaignId' | 'pageId' | 'regionId'
>

/**
 * A Media Slot video as its create returns it before the server has
 * resolved or fetched anything: `parentOrder: null`, the owner's scoping,
 * the picked source and id (none yet for a Watch address) and no text.
 */
export function newOwnedVideoBlock(
  id: string,
  owner: CampaignVideoOwner,
  pick: CampaignVideoPick
): CampaignVideoBlock {
  return {
    __typename: 'CampaignVideoBlock',
    id,
    campaignId: owner.campaignId,
    pageId: owner.pageId,
    regionId: owner.regionId,
    parentBlockId: owner.id,
    parentOrder: null,
    source: pick.source,
    videoId: 'videoId' in pick ? pick.videoId : null,
    videoVariantLanguageId: null,
    title: null,
    description: null,
    image: null,
    duration: null,
    mediaVideo: null
  }
}

export interface CreateOwnedVideoOptions {
  id: string
  owner: CampaignVideoOwner
  pick: CampaignVideoPick
}

export type CreateOwnedVideo = (
  options: CreateOwnedVideoOptions
) => Promise<ApolloLink.Result<CampaignVideoBlockCreate>>

/**
 * Fill a hero's or Featured Media section's Media Slot with a Campaign Video
 * through `campaignVideoBlockCreate`. The server points the owner's
 * `mediaBlockId` at it and soft-deletes what the slot held; the cache does
 * the same with the optimistic response (the video appended to the
 * campaign's block list, the owner's slot column written), so the canvas
 * shows the pick at once and a refused pick rolls back.
 */
export function useCampaignVideoBlockCreateMutation(
  campaignId: string
): CreateOwnedVideo {
  const client = useApolloClient()
  return useCallback(
    async ({ id, owner, pick }) =>
      await client.mutate<
        CampaignVideoBlockCreate,
        CampaignVideoBlockCreateVariables
      >({
        mutation: CAMPAIGN_VIDEO_BLOCK_CREATE,
        variables: {
          input: { id, campaignId, parentBlockId: owner.id, ...pick }
        },
        optimisticResponse: {
          campaignVideoBlockCreate: newOwnedVideoBlock(id, owner, pick)
        },
        update(cache, { data }) {
          const video = data?.campaignVideoBlockCreate
          if (video == null) return
          campaignBlockCreateUpdate(cache, campaignId, video)
          campaignBlockSlotWrite(cache, owner, 'mediaBlockId', video.id)
        }
      }),
    [client, campaignId]
  )
}
