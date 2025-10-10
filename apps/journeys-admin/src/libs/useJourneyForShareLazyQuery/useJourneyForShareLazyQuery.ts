import { gql } from '@apollo/client'
import { useLazyQuery } from '@apollo/client/react'

import {
  GetJourneyForSharing,
  GetJourneyForSharingVariables
} from '../../../__generated__/GetJourneyForSharing'

export const GET_JOURNEY_FOR_SHARING = gql`
  query GetJourneyForSharing($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      id
      slug
      language {
        id
        bcp47
        iso3
        name {
          value
          primary
        }
      }
      themeName
      themeMode
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
