import { ApolloClient } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignVideoBlockCreate,
  CampaignVideoBlockCreateVariables
} from '../../../__generated__/CampaignVideoBlockCreate'
import {
  CampaignBlockOwnerRef,
  campaignBlockCreateUpdate
} from '../campaignBlockCache'
import {
  CAMPAIGN_VIDEO_BLOCK_CREATE,
  CampaignVideoPick,
  newOwnedVideoBlock
} from '../useCampaignVideoBlockCreateMutation'

export interface CreateCarouselItemOptions {
  id: string
  carousel: CampaignBlockOwnerRef
  pick: CampaignVideoPick
  /** Where the item lands: after the carousel's children. */
  parentOrder: number
}

export type CreateCarouselItem = (
  options: CreateCarouselItemOptions
) => Promise<ApolloClient.MutateResult<CampaignVideoBlockCreate>>

/**
 * Add an explicit item to a Video Carousel through `campaignVideoBlockCreate`
 * with the carousel as parent: the server appends it after the carousel's
 * children. The optimistic item (the owned video's empty shape at the end
 * of the carousel) joins the campaign's block list at once.
 */
export function useCampaignCarouselItemCreateMutation(
  campaignId: string
): CreateCarouselItem {
  const [createItem] = useMutation<
    CampaignVideoBlockCreate,
    CampaignVideoBlockCreateVariables
  >(CAMPAIGN_VIDEO_BLOCK_CREATE)
  return useCallback(
    async ({ id, carousel, pick, parentOrder }) =>
      await createItem({
        variables: {
          input: { id, campaignId, parentBlockId: carousel.id, ...pick }
        },
        optimisticResponse: {
          campaignVideoBlockCreate: {
            ...newOwnedVideoBlock(id, carousel, pick),
            parentOrder
          }
        },
        update(cache, { data }) {
          campaignBlockCreateUpdate(
            cache,
            campaignId,
            data?.campaignVideoBlockCreate
          )
        }
      }),
    [createItem, campaignId]
  )
}
