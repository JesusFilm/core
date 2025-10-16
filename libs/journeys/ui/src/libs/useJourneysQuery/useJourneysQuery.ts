import {
  NoInfer,
  QueryHookOptions,
  QueryResult,
  useQuery
} from '@apollo/client'

import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

export type GetJourneys = ResultOf<typeof GET_JOURNEYS>
export type GetJourneysVariables = VariablesOf<typeof GET_JOURNEYS>

export const GET_JOURNEYS = graphql(`
  query GetJourneys($where: JourneysFilter) {
    journeys(where: $where) {
      id
      title
      createdAt
      publishedAt
      featuredAt
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
      tags {
        id
        parentId
        name {
          value
          language {
            id
          }
          primary
        }
      }
    }
  }
`)

export function useJourneysQuery(
  options?: QueryHookOptions<
    NoInfer<GetJourneys>,
    NoInfer<GetJourneysVariables>
  >
): QueryResult<GetJourneys, GetJourneysVariables> {
  const query = useQuery<GetJourneys, GetJourneysVariables>(
    GET_JOURNEYS,
    options
  )

  return query
}
