import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import { CampaignHeroBlockUpdateMedia } from '../../../__generated__/CampaignHeroBlockUpdateMedia'
import {
  GetCampaign_campaign_blocks_CampaignFeaturedMediaBlock as CampaignFeaturedMediaBlock,
  GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock
} from '../../../__generated__/GetCampaign'
import { useCampaignFeaturedMediaBlockUpdateMutation } from '../useCampaignFeaturedMediaBlockUpdateMutation'

export const CAMPAIGN_HERO_BLOCK_UPDATE_MEDIA = gql`
  mutation CampaignHeroBlockUpdateMedia(
    $id: ID!
    $input: CampaignHeroBlockUpdateInput!
  ) {
    campaignHeroBlockUpdate(id: $id, input: $input) {
      id
      mediaBlockId
    }
  }
`

/** The two sections with a Media Slot. */
export type CampaignMediaOwner = CampaignHeroBlock | CampaignFeaturedMediaBlock

export const CAMPAIGN_MEDIA_OWNER_TYPENAMES: ReadonlyArray<
  CampaignMediaOwner['__typename']
> = ['CampaignHeroBlock', 'CampaignFeaturedMediaBlock']

export function isCampaignMediaOwner(block: {
  __typename: string
}): block is CampaignMediaOwner {
  return (CAMPAIGN_MEDIA_OWNER_TYPENAMES as readonly string[]).includes(
    block.__typename
  )
}

export interface CampaignMediaSlotInput {
  mediaBlockId: string | null
}

export type CampaignMediaSlotMutate = (
  owner: CampaignMediaOwner,
  input: CampaignMediaSlotInput
) => Promise<ApolloLink.Result<unknown>>

/**
 * Point a hero's or Featured Media section's Media Slot at a block it owns,
 * or empty it (null), through the owner's own update mutation, shown
 * optimistically. The server soft-deletes the block the slot held and
 * restores the named one, so this is how a media pick is undone and redone.
 */
export function useCampaignMediaSlotMutation(): CampaignMediaSlotMutate {
  const client = useApolloClient()
  const writeFeaturedMedia = useCampaignFeaturedMediaBlockUpdateMutation()
  return useCallback(
    async (owner, input) => {
      if (owner.__typename === 'CampaignFeaturedMediaBlock')
        return await writeFeaturedMedia(owner, input)
      return await client.mutate<CampaignHeroBlockUpdateMedia>({
        mutation: CAMPAIGN_HERO_BLOCK_UPDATE_MEDIA,
        variables: { id: owner.id, input },
        optimisticResponse: {
          campaignHeroBlockUpdate: {
            __typename: 'CampaignHeroBlock',
            id: owner.id,
            mediaBlockId: input.mediaBlockId
          }
        }
      })
    },
    [client, writeFeaturedMedia]
  )
}
