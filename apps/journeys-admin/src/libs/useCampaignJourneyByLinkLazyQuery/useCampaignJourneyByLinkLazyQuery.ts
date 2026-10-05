import { gql } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'

import {
  GetCampaignJourneyByLink,
  GetCampaignJourneyByLinkVariables
} from '../../../__generated__/GetCampaignJourneyByLink'

/**
 * The public journey read behind the journey paste field: by id or slug with
 * the routing filter skipped, `published` only, any team (PRD §5). The
 * server re-resolves on link; this read only shows the author what a paste
 * points at before they keep it.
 */
export const GET_CAMPAIGN_JOURNEY_BY_LINK = gql`
  query GetCampaignJourneyByLink($id: ID!, $idType: IdType) {
    journey(
      id: $id
      idType: $idType
      options: { skipRoutingFilter: true, status: [published] }
    ) {
      id
      title
      slug
      status
    }
  }
`

export function useCampaignJourneyByLinkLazyQuery(): useLazyQuery.ResultTuple<
  GetCampaignJourneyByLink,
  GetCampaignJourneyByLinkVariables
> {
  return useLazyQuery<
    GetCampaignJourneyByLink,
    GetCampaignJourneyByLinkVariables
  >(GET_CAMPAIGN_JOURNEY_BY_LINK, { fetchPolicy: 'network-only' })
}
