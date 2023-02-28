import { gql, OperationVariables, QueryResult, useQuery } from '@apollo/client'
// import { useEffect, useState } from 'react'
import { GetActiveJourneys } from '../../../__generated__/GetActiveJourneys'

export const GET_ACTIVE_JOURNEYS = gql`
  query GetActiveJourneys {
    journeys: adminJourneys(status: [draft, published]) {
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

export function useActiveJourneys():
  | QueryResult<GetActiveJourneys, OperationVariables>
  | undefined {
  // const [activeJourneys, setActiveJourneys] = useState<
  //   QueryResult<GetActiveJourneys, OperationVariables> | undefined
  // >(undefined)
  const res = useQuery<GetActiveJourneys>(GET_ACTIVE_JOURNEYS)

  // useEffect(() => {
  //   if (res != null) {
  //     setActiveJourneys(res)
  //   }
  // }, [setActiveJourneys, res])

  return res
}
