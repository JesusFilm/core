import {
  NoInfer,
  QueryHookOptions,
  QueryResult,
  gql,
  useQuery
} from '@apollo/client'

import {
  GetJourneysQuery,
  GetJourneysQueryVariables
} from './__generated__/useJourneysQuery'

export const GET_JOURNEYS = gql`
  query GetJourneys($where: JourneysFilter) {
    journeys(where: $where) {
      id
      title
      createdAt
      publishedAt
      featuredAt
      trashedAt
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
    NoInfer<GetJourneysQuery>,
    NoInfer<GetJourneysQueryVariables>
  >
): QueryResult<GetJourneysQuery, GetJourneysQueryVariables> {
  const query = useQuery<GetJourneysQuery, GetJourneysQueryVariables>(
    GET_JOURNEYS,
    options
  )

  return query
}
