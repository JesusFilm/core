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
 * everything orphaned by the prune. Called from `onCompleted` — after the
 * caller has navigated away from the page that watches the campaign by id —
 * so its `GetCampaign` is already unmounted and its refetch can not surface
 * a NOT_FOUND "Campaign not found".
 */
export function evictCampaignFromCache(
  cache: ReturnType<typeof useApolloClient>['cache'] | undefined,
  deletedId: string
): void {
  if (cache == null) return
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
  const { cache } = useApolloClient()
  return useMutation<CampaignDelete, CampaignDeleteVariables>(CAMPAIGN_DELETE, {
    onCompleted(result) {
      const deletedId = result?.campaignDelete?.id
      if (deletedId == null) return
      // Defer past the microtask the caller's redirect handler queues, so the
      // cache is pruned only once the watching page is gone.
      void Promise.resolve().then(() =>
        evictCampaignFromCache(cache, deletedId)
      )
    },
    ...options
  })
}
