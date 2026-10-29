import { ApolloClient, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'
import { useCallback } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignImageBlockCreate,
  CampaignImageBlockCreateVariables
} from '../../../__generated__/CampaignImageBlockCreate'
import { GetCampaign_campaign_blocks_CampaignImageBlock } from '../../../__generated__/GetCampaign'
import {
  CampaignBackgroundKind,
  CampaignImageSlot
} from '../../../__generated__/globalTypes'
import {
  CampaignBlockOwnerRef,
  campaignBlockCreateUpdate,
  campaignBlockSlotWrite
} from '../campaignBlockCache'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery/campaignFields'

export type CampaignImageBlock = GetCampaign_campaign_blocks_CampaignImageBlock

export const CAMPAIGN_IMAGE_BLOCK_CREATE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  ${CAMPAIGN_BLOCK_TRANSLATION_FIELDS}
  mutation CampaignImageBlockCreate(
    $input: CampaignImageBlockCreateInput!
    $languageId: ID
  ) {
    campaignImageBlockCreate(input: $input) {
      ...CampaignPublicBlockFields
      ...CampaignBlockTranslationFields
    }
  }
`

/**
 * An owned image as its create returns it before the server has measured it:
 * `parentOrder: null`, the owner's scoping, the given src and no size yet.
 */
export function newOwnedImageBlock(
  id: string,
  owner: CampaignBlockOwnerRef,
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
    altTranslations: [],
    width: null,
    height: null,
    focalLeft: 50,
    focalTop: 50,
    scale: null
  }
}

export interface CreateOwnedImageOptions {
  id: string
  owner: CampaignBlockOwnerRef
  slot: CampaignImageSlot
  src: string
}

export type CreateOwnedImage = (
  options: CreateOwnedImageOptions
) => Promise<ApolloClient.MutateResult<CampaignImageBlockCreate>>

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
  const [createImage] = useMutation<
    CampaignImageBlockCreate,
    CampaignImageBlockCreateVariables
  >(CAMPAIGN_IMAGE_BLOCK_CREATE)
  return useCallback(
    async ({ id, owner, slot, src }) =>
      await createImage({
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
    [createImage, campaignId]
  )
}
