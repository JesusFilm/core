import { gql, useLazyQuery } from '@apollo/client'

import {
  GetJourneyForSharing,
  GetJourneyForSharingVariables
} from '../../../__generated__/GetJourneyForSharing'

export const GET_JOURNEY_FOR_SHARING = gql`
  query GetJourneyForSharing($id: ID!) {
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

export function useJourneyForSharingLazyQuery() {
  return useLazyQuery<GetJourneyForSharing, GetJourneyForSharingVariables>(
    GET_JOURNEY_FOR_SHARING
  )
}
