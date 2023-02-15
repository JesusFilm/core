import { gql, useQuery } from '@apollo/client'
import {
  GetJourneys,
  GetJourneys_journeys as Journeys
} from '../../../__generated__/GetJourneys'

export const GET_JOURNEYS = gql`
  query GetJourneys {
    journeys: adminJourneys {
      id
      title
      createdAt
      publishedAt
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

export function useJourneys(): Journeys[] | undefined {
  const { data } = useQuery<GetJourneys>(GET_JOURNEYS)
  return data?.journeys
}
