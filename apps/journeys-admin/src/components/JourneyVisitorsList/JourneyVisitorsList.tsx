import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import { GetJourneyVisitors } from '../../../__generated__/GetJourneyVisitors'
import { VisitorCard } from './VisitorCard'

export const GET_JOURNEY_VISITORS = gql`
  query GetJourneyVisitors($filter: JourneyVisitorFilter!) {
    visitors: journeyVisitorsConnection(teamId: "jfp-team", filter: $filter) {
      edges {
        cursor
        node {
          visitorId
          countryCode
          createdAt
          duration
          visitor {
            name
            status
            referrer
          }
          events {
            id
            createdAt
            label
            value
          }
        }
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`

interface Props {
  id: string
}

export function JourneyVisitorsList({ id }: Props): ReactElement {
  const { data } = useQuery<GetJourneyVisitors>(GET_JOURNEY_VISITORS, {
    variables: {
      filter: { journeyId: id }
    }
  })

  return (
    <Box sx={{ mx: { xs: -6, sm: 0 } }}>
      {data?.visitors != null ? (
        data.visitors.edges.map((visitor) => (
          <VisitorCard
            key={visitor.node.visitorId}
            visitorNode={visitor.node}
          />
        ))
      ) : (
        <></>
      )}
    </Box>
  )
}
