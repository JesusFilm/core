import { OperationVariables, gql } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'

import { GetCampaignAccessibleJourneys } from '../../../__generated__/GetCampaignAccessibleJourneys'

/**
 * Every journey the author can read, across all of their teams and those
 * shared with them, in one call: published and archived only (a draft never
 * renders on the public page) and no templates. Behind the campaign
 * editor's journey picker, which filters the list by title as the author types.
 */
export const GET_CAMPAIGN_ACCESSIBLE_JOURNEYS = gql`
  query GetCampaignAccessibleJourneys {
    journeys: adminJourneys(
      status: [published, archived]
      template: false
      allAccessible: true
    ) {
      id
      title
      description
      slug
      status
      team {
        id
        title
      }
    }
  }
`

export function useCampaignAccessibleJourneysLazyQuery(): useLazyQuery.ResultTuple<
  GetCampaignAccessibleJourneys,
  OperationVariables
> {
  return useLazyQuery<GetCampaignAccessibleJourneys>(
    GET_CAMPAIGN_ACCESSIBLE_JOURNEYS,
    { fetchPolicy: 'network-only' }
  )
}
