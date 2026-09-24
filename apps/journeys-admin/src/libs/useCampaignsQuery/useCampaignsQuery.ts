import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaigns,
  GetCampaignsVariables
} from '../../../__generated__/GetCampaigns'
import { CAMPAIGN_FIELDS } from '../campaignFields'

export const GET_CAMPAIGNS = gql`
  ${CAMPAIGN_FIELDS}
  query GetCampaigns($teamId: ID!) {
    campaigns(teamId: $teamId) {
      ...CampaignFields
    }
  }
`

export function useCampaignsQuery(
  variables?: GetCampaignsVariables,
  options?: { skip?: boolean }
): useQuery.Result<
  GetCampaigns,
  GetCampaignsVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignsVariables>
> {
  return useQuery<GetCampaigns, GetCampaignsVariables>(
    GET_CAMPAIGNS,
    variables == null || options?.skip === true ? skipToken : { variables }
  )
}
