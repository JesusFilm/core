import { gql, useQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import { ReactElement, useEffect } from 'react'
import { GetVisitorEvents } from '../../../../__generated__/GetVisitorEvents'
import { transformVisitorEvents } from '../transformVisitorEvents'
import { useVisitorInfo } from '../VisitorInfoProvider'
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
        ... on SignUpSubmissionEvent {
          email
        }
        ... on VideoStartEvent {
          source
        }
        ... on VideoCompleteEvent {
          source
        }
        ... on ChatOpenEvent {
          messagePlatform
        }
      }
    }
  }
`

export function VisitorJourneyList({ id, limit }: Props): ReactElement {
  const {
    state: { journey },
    dispatch
  } = useVisitorInfo()
  const { data } = useQuery<GetVisitorEvents>(GET_VISITOR_EVENTS, {
    variables: { id }
  })
  const journeys = transformVisitorEvents(data?.visitor.events, limit)

  useEffect(() => {
    if (journey == null && journeys[0] != null) {
      dispatch({ type: 'SetJourneyAction', journey: journeys[0], open: false })
    }
  }, [dispatch, journey, journeys])

  return (
    <Stack spacing={4}>
      {journeys.map((item) => (
        <VisitorJourneyListItem
          key={item.id}
          journey={item}
          selected={journey?.id === item.id}
        />
      ))}
    </Stack>
  )
}
