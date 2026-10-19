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
      focalLeft
      focalTop
    }
  }
`

/** The image body as the update input takes it; `src: null` clears the picture, the focal point is a percentage from the left and the top. */
export interface CampaignImageMediaInput {
  src?: string | null
  alt?: string | null
  focalLeft?: number | null
  focalTop?: number | null
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
    height: src === block.src ? block.height : null,
    focalLeft: 'focalLeft' in input ? (input.focalLeft ?? null) : block.focalLeft,
    focalTop: 'focalTop' in input ? (input.focalTop ?? null) : block.focalTop
  }
}

export type CampaignImageMediaMutate = (
  block: CampaignImageBlock,
  input: CampaignImageMediaInput
) => Promise<ApolloLink.Result<CampaignImageBlockUpdateMedia>>

/**
 * Write an image's picture, alt text or focal point through
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
