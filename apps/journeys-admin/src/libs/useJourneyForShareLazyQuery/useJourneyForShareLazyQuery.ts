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
      title
      description
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
      primaryImageBlock {
        id
        parentBlockId
        parentOrder
        src
        alt
        width
        height
        blurhash
        scale
        focalTop
        focalLeft
      }
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
