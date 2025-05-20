import {
  NoInfer,
  QueryHookOptions,
  QueryResult,
  gql,
  useQuery
} from '@apollo/client'

import { GetJourneys, GetJourneysVariables } from './__generated__/GetJourneys'

export const GET_JOURNEYS = gql`
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
`

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
