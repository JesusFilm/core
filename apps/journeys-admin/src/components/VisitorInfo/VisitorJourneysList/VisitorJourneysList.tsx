import { gql, useQuery } from '@apollo/client'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import { ReactElement } from 'react'

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
            name {
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

interface VisitorJourneysListProps {
  id: string
}

export function VisitorJourneysList({
  id
}: VisitorJourneysListProps): ReactElement {
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
                  ml: { xs: '66px', sm: '66px', md: '98px' }
                }}
              />
            </TimelineSeparator>
          )}
        </>
      ))}
    </>
  )
}
