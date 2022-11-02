import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { GetVisitorEvents } from '../../../../__generated__/GetVisitorEvents'
import { transformVisitorEvents } from '../transformVisitorEvents'
import { VisitorJourneyListItem } from './VisitorJourneyListItem'

interface Props {
  id: string
  limit?: number
}

export const GET_VISITOR_EVENTS = gql`
  query GetVisitorEvents($id: ID!) {
    visitor(id: $id) {
      id
      events {
        id
        journeyId
        label
        value
        createdAt
        ... on JourneyViewEvent {
          language {
            id
            name(primary: true) {
              value
            }
          }
        }
      }
    }
  }
`

export function VisitorJourneyList({ id, limit }: Props): ReactElement {
  const { data } = useQuery<GetVisitorEvents>(GET_VISITOR_EVENTS, {
    variables: { id }
  })
  const journeys = transformVisitorEvents(data?.visitor.events, limit)

  return (
    <Stack spacing={4} sx={{ p: 4 }}>
      {journeys.map((item) => (
        <VisitorJourneyListItem key={item.id} {...item} />
      ))}
    </Stack>
  )
}
