import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaigns,
  GetCampaignsVariables
} from '../../../__generated__/GetCampaigns'

export const GET_CAMPAIGNS = gql`
  query GetCampaigns($teamId: ID!) {
    campaigns(teamId: $teamId) {
      id
      teamId
      title
      slug
      status
      publishedAt
      createdAt
      updatedAt
    }
  }
`

export function useCampaignsQuery(
  variables?: GetCampaignsVariables
): useQuery.Result<
  GetCampaigns,
  GetCampaignsVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignsVariables>
> {
  return useQuery<GetCampaigns, GetCampaignsVariables>(
    GET_CAMPAIGNS,
    variables == null ? skipToken : { variables }
  )
}
