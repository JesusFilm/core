import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaign,
  GetCampaignVariables
} from '../../../__generated__/GetCampaign'
import { CAMPAIGN_FIELDS } from '../campaignFields'

export const GET_CAMPAIGN = gql`
  ${CAMPAIGN_FIELDS}
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      ...CampaignFields
    }
  }
`

export function useCampaignQuery(
  variables?: GetCampaignVariables,
  options?: { skip?: boolean }
): useQuery.Result<
  GetCampaign,
  GetCampaignVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignVariables>
> {
  return useQuery<GetCampaign, GetCampaignVariables>(
    GET_CAMPAIGN,
    variables == null || options?.skip === true ? skipToken : { variables }
  )
}
