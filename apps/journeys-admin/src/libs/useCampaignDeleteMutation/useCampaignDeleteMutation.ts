import { Reference, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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

export function useCampaignDeleteMutation(
  options?: useMutation.Options<CampaignDelete, CampaignDeleteVariables>
): useMutation.ResultTuple<CampaignDelete, CampaignDeleteVariables> {
  return useMutation<CampaignDelete, CampaignDeleteVariables>(CAMPAIGN_DELETE, {
    update(cache, { data }) {
      if (data?.campaignDelete == null) return
      const deletedId = data.campaignDelete.id
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
    },
    ...options
  })
}
