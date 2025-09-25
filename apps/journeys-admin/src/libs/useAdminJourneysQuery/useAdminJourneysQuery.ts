import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../__generated__/GetAdminJourneys'

export const GET_ADMIN_JOURNEYS = gql`
  query GetAdminJourneys(
    $status: [JourneyStatus!]
    $template: Boolean
    $useLastActiveTeamId: Boolean
  ) {
    journeys: adminJourneys(
      status: $status
      template: $template
      useLastActiveTeamId: $useLastActiveTeamId
    ) {
      id
      title
      createdAt
      publishedAt
      trashedAt
      updatedAt
      description
      slug
      themeName
      themeMode
      language {
        id
        name {
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
      fromTemplateId
    }
  }
`

export function useAdminJourneysQuery(
  variables?: GetAdminJourneysVariables
): QueryResult<GetAdminJourneys, GetAdminJourneysVariables> {
  const query = useQuery<GetAdminJourneys, GetAdminJourneysVariables>(
    GET_ADMIN_JOURNEYS,
    {
      variables
    }
  )

  return query
}
