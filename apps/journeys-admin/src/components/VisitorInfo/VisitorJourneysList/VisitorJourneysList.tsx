import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
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
        ... on ButtonClickEvent {
          action
          actionValue
        }
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
        ... on VideoCollapseEvent {
          position
          source
        }
        ... on VideoExpandEvent {
          position
          source
        }
        ... on VideoPauseEvent {
          position
          source
        }
        ... on VideoPlayEvent {
          position
          source
        }
        ... on VideoStartEvent {
          position
          source
        }
        ... on VideoProgressEvent {
          position
          source
          progress
        }
      }
    }
  }
`

interface Props {
  id: string
}

export function VisitorJourneysList({ id }: Props): ReactElement {
  const { data } = useQuery<GetVisitorEvents>(GET_VISITOR_EVENTS, {
    variables: { id }
  })
  const journeys = transformToJourney(data?.visitor.events)
  return (
    <>
      {journeys.map((journey, index, array) => (
        <>
          <EventsCard key={journey.id} journey={journey} />
          {index + 1 < array.length && (
            <TimelineSeparator sx={{ justifyContent: 'flex-start' }}>
              <TimelineConnector
                sx={{
                  height: '24px',
                  alignSelf: 'flex-start',
                  ml: { xs: '74px', sm: '98px' }
                }}
              />
            </TimelineSeparator>
          )}
        </>
      ))}
    </>
  )
}
