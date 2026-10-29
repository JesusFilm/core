import { ApolloClient, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignVideoBlockCreate,
  CampaignVideoBlockCreateVariables
} from '../../../__generated__/CampaignVideoBlockCreate'
import { GetCampaign_campaign_blocks_CampaignVideoBlock } from '../../../__generated__/GetCampaign'
import { VideoBlockSource } from '../../../__generated__/globalTypes'
import {
  CampaignBlockOwnerRef,
  campaignBlockCreateUpdate,
  campaignBlockSlotWrite
} from '../campaignBlockCache'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery/campaignFields'

export type CampaignVideoBlock = GetCampaign_campaign_blocks_CampaignVideoBlock

export const CAMPAIGN_VIDEO_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignVideoBlockCreate(
    $input: CampaignVideoBlockCreateInput!
    $languageId: ID
  ) {
    campaignVideoBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
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

/**
 * A Media Slot video as its create returns it before the server has
 * resolved or fetched anything: `parentOrder: null`, the owner's scoping,
 * the picked source and id (none yet for a Watch address) and no text.
 */
export function newOwnedVideoBlock(
  id: string,
  owner: CampaignBlockOwnerRef,
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
    titleTranslations: [],
    descriptionTranslations: [],
    image: null,
    duration: null,
    mediaVideo: null
  }
}

export interface CreateOwnedVideoOptions {
  id: string
  owner: CampaignBlockOwnerRef
  pick: CampaignVideoPick
}

export type CreateOwnedVideo = (
  options: CreateOwnedVideoOptions
) => Promise<ApolloClient.MutateResult<CampaignVideoBlockCreate>>

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
  const [createVideo] = useMutation<
    CampaignVideoBlockCreate,
    CampaignVideoBlockCreateVariables
  >(CAMPAIGN_VIDEO_BLOCK_CREATE)
  return useCallback(
    async ({ id, owner, pick }) =>
      await createVideo({
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
    [createVideo, campaignId]
  )
}
