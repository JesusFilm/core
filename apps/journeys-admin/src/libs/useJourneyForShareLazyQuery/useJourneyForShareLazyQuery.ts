import { gql, useLazyQuery } from '@apollo/client'

import {
  GetJourneyForShare,
  GetJourneyForShareVariables
} from '../../../__generated__/GetJourneyForShare'

export const GET_JOURNEY_FOR_SHARE = gql`
  query GetJourneyForShare($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      slug
      team {
        id
        customDomains {
          name
        }
      }
    }
  }
`

export function useJourneyForShareLazyQuery() {
  return useLazyQuery<GetJourneyForShare, GetJourneyForShareVariables>(
    GET_JOURNEY_FOR_SHARE
  )
}
