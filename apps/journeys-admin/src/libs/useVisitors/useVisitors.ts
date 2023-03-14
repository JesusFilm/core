import { gql, useQuery } from '@apollo/client'
import {
  GetVisitors,
  GetVisitors_visitors_edges as Visitor
} from '../../../__generated__/GetVisitors'

export const GET_VISITORS = gql`
  query GetVisitors {
    visitors: visitorsConnection(teamId: "jfp-team") {
      edges {
        node {
          createdAt
          email
          id
          name
          status
        }
      }
    }
  }
`

export function useVisitors(): Visitor[] | undefined {
  const { data } = useQuery<GetVisitors>(GET_VISITORS)
  return data?.visitors.edges
}
