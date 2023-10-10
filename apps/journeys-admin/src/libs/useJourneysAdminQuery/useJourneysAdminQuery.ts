import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetJourneysAdmin,
  GetJourneysAdminVariables
} from '../../../__generated__/GetJourneysAdmin'

export const GET_JOURNEYS_ADMIN = gql`
  query GetJourneysAdmin(
    $status: [JourneyStatus!]
    $template: Boolean
    $teamId: ID
  ) {
    journeys: adminJourneys(
      status: $status
      template: $template
      teamId: $teamId
    ) {
      id
      title
      createdAt
      publishedAt
      trashedAt
      description
      slug
      themeName
      themeMode
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      status
      seoTitle
      seoDescription
      template
      userJourneys {
        id
        role
        openedAt
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
      primaryImageBlock {
        id
        parentBlockId
        parentOrder
        src
        alt
        width
        height
        blurhash
      }
    }
  }
`

export function useJourneysAdminQuery(
  variables?: GetJourneysAdminVariables
): QueryResult<GetJourneysAdmin, GetJourneysAdminVariables> {
  const query = useQuery<GetJourneysAdmin, GetJourneysAdminVariables>(
    GET_JOURNEYS_ADMIN,
    {
      variables
    }
  )

  return query
}
