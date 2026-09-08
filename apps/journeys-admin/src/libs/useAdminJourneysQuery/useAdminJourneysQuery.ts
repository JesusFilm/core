import { WatchQueryFetchPolicy, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import {
  GetAdminJourneys,
  GetAdminJourneysVariables
} from '../../../__generated__/GetAdminJourneys'

export const GET_ADMIN_JOURNEYS = gql`
  query GetAdminJourneys(
    $status: [JourneyStatus!]
    $template: Boolean
    $teamId: ID
    $useLastActiveTeamId: Boolean
  ) {
    journeys: adminJourneys(
      status: $status
      template: $template
      teamId: $teamId
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
          ... on AuthenticatedUser {
            firstName
            lastName
            imageUrl
          }
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
      team {
        id
      }
      fromTemplateId
      journeyCustomizationDescription
      journeyCustomizationFields {
        id
        journeyId
        key
        value
        defaultValue
      }
      website
      customizable
    }
  }
`

export function useAdminJourneysQuery(
  variables?: GetAdminJourneysVariables,
  options?: { skip?: boolean; fetchPolicy?: WatchQueryFetchPolicy }
): useQuery.Result<
  GetAdminJourneys,
  GetAdminJourneysVariables,
  'empty' | 'complete' | 'streaming'
> {
  const query = useQuery<GetAdminJourneys, GetAdminJourneysVariables>(
    GET_ADMIN_JOURNEYS,
    {
      variables,
      skip: options?.skip,
      fetchPolicy: options?.fetchPolicy
    }
  )

  return query
}
