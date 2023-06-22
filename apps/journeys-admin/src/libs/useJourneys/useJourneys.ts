import { QueryResult, gql, useQuery } from '@apollo/client'
import {
  GetJourneys,
  GetJourneysVariables
} from '../../../__generated__/GetJourneys'

export const GET_JOURNEYS = gql`
  query GetJourneys($status: [JourneyStatus!], $template: Boolean) {
    journeys: adminJourneys(status: $status, template: $template) {
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
    }
  }
`

export function useJourneys(
  variables?: GetJourneysVariables
): QueryResult<GetJourneys, GetJourneysVariables> {
  const query = useQuery<GetJourneys, GetJourneysVariables>(GET_JOURNEYS, {
    variables
  })

  return query
}
