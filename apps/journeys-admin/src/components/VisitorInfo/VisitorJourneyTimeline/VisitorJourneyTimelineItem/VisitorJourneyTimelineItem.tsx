import { ReactElement } from 'react'

enum EventType {
  JourneyViewEvent
}
interface Props {
  event: { __typename: EventType }
  variant?: 'compact'
}

export function VisitorJourneyTimelineItem({ event }: Props): ReactElement {
  return <>{event.__typename}</>
}
