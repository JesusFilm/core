import { gql, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
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

export function useJourneys(): Journeys[] | undefined {
  const [journeys, setJourneys] = useState<Journeys[] | undefined>(undefined)
  const { data } = useQuery<GetJourneys>(GET_JOURNEYS)

  useEffect(() => {
    if (data?.journeys != null) {
      setJourneys(data.journeys)
    }
  }, [data?.journeys, setJourneys])

  return journeys
}
