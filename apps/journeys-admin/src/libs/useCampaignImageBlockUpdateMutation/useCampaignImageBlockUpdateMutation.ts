import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignImageBlockUpdateMedia,
  CampaignImageBlockUpdateMediaVariables,
  CampaignImageBlockUpdateMedia_campaignImageBlockUpdate as CampaignImageMediaRow
} from '../../../__generated__/CampaignImageBlockUpdateMedia'
import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../__generated__/GetCampaign'

export const CAMPAIGN_IMAGE_BLOCK_UPDATE_MEDIA = gql`
  mutation CampaignImageBlockUpdateMedia(
    $id: ID!
    $input: CampaignImageBlockUpdateInput!
  ) {
    campaignImageBlockUpdate(id: $id, input: $input) {
      id
      src
      alt
      width
      height
    }
  }
`

/** The image body as the update input takes it; `src: null` clears the picture. */
export interface CampaignImageMediaInput {
  src?: string | null
  alt?: string | null
}

/** The row the media update returns: the picture with `input` applied; a new src has no size until the server measures it. */
export function campaignImageMediaRow(
  block: CampaignImageBlock,
  input: CampaignImageMediaInput
): CampaignImageMediaRow {
  const src = 'src' in input ? (input.src ?? null) : block.src
  return {
    __typename: 'CampaignImageBlock',
    id: block.id,
    src,
    alt: 'alt' in input ? (input.alt ?? null) : block.alt,
    width: src === block.src ? block.width : null,
    height: src === block.src ? block.height : null
  }
}

export type CampaignImageMediaMutate = (
  block: CampaignImageBlock,
  input: CampaignImageMediaInput
) => Promise<ApolloLink.Result<CampaignImageBlockUpdateMedia>>

/**
 * Write an Image section's picture or alt text through
 * `campaignImageBlockUpdate`, shown optimistically as the block with the
 * input applied; the server re-measures a new src and the response brings
 * the size.
 */
export function useCampaignImageBlockUpdateMutation(): CampaignImageMediaMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignImageBlockUpdateMedia,
        CampaignImageBlockUpdateMediaVariables
      >({
        mutation: CAMPAIGN_IMAGE_BLOCK_UPDATE_MEDIA,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignImageBlockUpdate: campaignImageMediaRow(block, input)
        }
      }),
    [client]
  )
}
