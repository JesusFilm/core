import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { GetVisitorEvents } from '../../../../__generated__/GetVisitorEvents'
import { EventsCard } from './EventsCard'
import { transformToJourney } from './utils/transformToJourney'

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

interface Props {
  id: string
}

export function JourneyList({ id }: Props): ReactElement {
  const { data } = useQuery<GetVisitorEvents>(GET_VISITOR_EVENTS, {
    variables: { id }
  })
  const journeys = transformToJourney(data?.visitor.events)
  return (
    <>
      {journeys.map((journey) => (
        <EventsCard key={journey.id} journey={journey} />
      ))}
    </>
  )
}
