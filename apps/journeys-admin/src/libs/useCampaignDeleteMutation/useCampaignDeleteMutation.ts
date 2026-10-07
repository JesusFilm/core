import { Reference, gql } from '@apollo/client'
import { useApolloClient, useMutation } from '@apollo/client/react'

import {
  CampaignDelete,
  CampaignDeleteVariables
} from '../../../__generated__/CampaignDelete'

export const CAMPAIGN_DELETE = gql`
  mutation CampaignDelete($id: ID!) {
    campaignDelete(id: $id) {
      id
    }
  }
`

/**
 * Drop the deleted campaign from the cache: out of the list, the entity and
 * everything orphaned by the prune. Call it once the redirect away from the
 * page that watches the campaign by id has resolved, so its `GetCampaign` is
 * unmounted and its refetch can not surface a NOT_FOUND "Campaign not found".
 */
export function evictCampaignFromCache(
  cache: ReturnType<typeof useApolloClient>['cache'],
  deletedId: string
): void {
  cache.modify({
    fields: {
      campaigns(existingRefs = [], { readField }) {
        return (existingRefs as readonly Reference[]).filter(
          (ref) => readField('id', ref) !== deletedId
        )
      }
    }
  })
  cache.evict({
    id: cache.identify({ __typename: 'Campaign', id: deletedId })
  })
  cache.gc()
}

export function useCampaignDeleteMutation(
  options?: useMutation.Options<CampaignDelete, CampaignDeleteVariables>
): useMutation.ResultTuple<CampaignDelete, CampaignDeleteVariables> {
  return useMutation<CampaignDelete, CampaignDeleteVariables>(
    CAMPAIGN_DELETE,
    options
  )
}
