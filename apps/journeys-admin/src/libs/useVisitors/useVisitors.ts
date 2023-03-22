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
          id
          createdAt
          events {
            ... on ChatOpenEvent {
              id
              journeyId
              createdAt
              label
              value
              messagePlatform
            }
            ... on TextResponseSubmissionEvent {
              id
              journeyId
              createdAt
              label
              value
            }
            ... on RadioQuestionSubmissionEvent {
              id
              journeyId
              createdAt
              label
              value
            }
            ... on ButtonClickEvent {
              id
              journeyId
              createdAt
              label
              value
            }
          }
        }
      }
    }
  }
`

export function useVisitors(): Visitor[] | undefined {
  const { data } = useQuery<GetVisitors>(GET_VISITORS)
  return data?.visitors.edges
}
