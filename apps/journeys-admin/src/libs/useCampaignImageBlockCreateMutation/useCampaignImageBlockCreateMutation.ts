import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignImageBlockCreate,
  CampaignImageBlockCreateVariables
} from '../../../__generated__/CampaignImageBlockCreate'
import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_blocks_CampaignImageBlock
} from '../../../__generated__/GetCampaign'
import {
  CampaignBackgroundKind,
  CampaignImageSlot
} from '../../../__generated__/globalTypes'
import {
  campaignBlockCreateUpdate,
  campaignBlockSlotWrite
} from '../campaignBlockCache'

export type CampaignImageBlock = GetCampaign_campaign_blocks_CampaignImageBlock

export const CAMPAIGN_IMAGE_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignImageBlockCreate(
    $input: CampaignImageBlockCreateInput!
    $languageId: ID
  ) {
    campaignImageBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
    }
  }
`

/** The columns of a block that owns an image: the section or chrome block the image copies its scoping from. */
export type CampaignImageOwner = Pick<
  CampaignBlock,
  '__typename' | 'id' | 'campaignId' | 'pageId' | 'regionId'
>

/**
 * An owned image as its create returns it before the server has measured it:
 * `parentOrder: null`, the owner's scoping, the given src and no size yet.
 */
export function newOwnedImageBlock(
  id: string,
  owner: CampaignImageOwner,
  src: string
): CampaignImageBlock {
  return {
    __typename: 'CampaignImageBlock',
    id,
    campaignId: owner.campaignId,
    pageId: owner.pageId,
    regionId: owner.regionId,
    parentBlockId: owner.id,
    parentOrder: null,
    backgroundKind: CampaignBackgroundKind.none,
    backgroundColor: null,
    coverBlockId: null,
    backgroundOverlay: null,
    headingColor: null,
    textColor: null,
    buttonColor: null,
    buttonTextColor: null,
    accentColor: null,
    src,
    alt: null,
    width: null,
    height: null
  }
}

export interface CreateOwnedImageOptions {
  id: string
  owner: CampaignImageOwner
  slot: CampaignImageSlot
  src: string
}

export type CreateOwnedImage = (
  options: CreateOwnedImageOptions
) => Promise<ApolloLink.Result<CampaignImageBlockCreate>>

/**
 * Create an owned image (a section's cover, the header logo or a Media
 * Slot) through `campaignImageBlockCreate`, shown optimistically with the
 * given src, and append it to the campaign's cached block list so the canvas
 * trees it through the owner's slot column as soon as that column is
 * written. A Media Slot pick writes that column here, as the server does, so
 * the section shows the picture with the optimistic response.
 */
export function useCampaignImageBlockCreateMutation(
  campaignId: string
): CreateOwnedImage {
  const client = useApolloClient()
  return useCallback(
    async ({ id, owner, slot, src }) =>
      await client.mutate<
        CampaignImageBlockCreate,
        CampaignImageBlockCreateVariables
      >({
        mutation: CAMPAIGN_IMAGE_BLOCK_CREATE,
        variables: {
          input: { id, campaignId, parentBlockId: owner.id, slot, src }
        },
        optimisticResponse: {
          campaignImageBlockCreate: newOwnedImageBlock(id, owner, src)
        },
        update(cache, { data }) {
          const image = data?.campaignImageBlockCreate
          campaignBlockCreateUpdate(cache, campaignId, image)
          if (image != null && slot === CampaignImageSlot.media)
            campaignBlockSlotWrite(cache, owner, 'mediaBlockId', image.id)
        }
      }),
    [client, campaignId]
  )
}
