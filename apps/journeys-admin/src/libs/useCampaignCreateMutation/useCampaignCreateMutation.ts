import { Reference, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignCreate,
  CampaignCreateVariables
} from '../../../__generated__/CampaignCreate'
import { CAMPAIGN_FIELDS } from '../useCampaignQuery'

export const CAMPAIGN_CREATE = gql`
  ${CAMPAIGN_FIELDS}
  mutation CampaignCreate($input: CampaignCreateInput!) {
    campaignCreate(input: $input) {
      ...CampaignFields
    }
  }
`

export function useCampaignCreateMutation(
  options?: useMutation.Options<CampaignCreate, CampaignCreateVariables>
): useMutation.ResultTuple<CampaignCreate, CampaignCreateVariables> {
  return useMutation<CampaignCreate, CampaignCreateVariables>(CAMPAIGN_CREATE, {
    update(cache, { data }) {
      if (data?.campaignCreate == null) return
      const created = data.campaignCreate
      cache.modify({
        fields: {
          campaigns(existingRefs = [], { storeFieldName, toReference }) {
            if (!storeFieldName.includes(created.teamId)) return existingRefs
            const ref = toReference({
              __typename: created.__typename,
              id: created.id
            })
            if (ref == null) return existingRefs
            return [ref, ...(existingRefs as readonly Reference[])]
          }
        }
      })
    },
    ...options
  })
}
