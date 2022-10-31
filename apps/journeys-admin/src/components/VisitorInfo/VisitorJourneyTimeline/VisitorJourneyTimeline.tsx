import { ReactElement } from 'react'
import { VisitorJourneyTimelineItem } from './VisitorJourneyTimelineItem'

enum EventType {
  JourneyViewEvent
}

interface Props {
  events: Array<{ __typename: EventType; id: string }>
  variant?: 'compact'
  filter?: EventType[]
}

export function VisitorJourneyTimeline({
  events,
  variant,
  filter = []
}: Props): ReactElement {
  return (
    <>
      {events
        .filter((item) => filter.includes(item.__typename))
        .map((item) => (
          <VisitorJourneyTimelineItem
            key={item.id}
            event={item}
            variant={variant}
          />
        ))}
    </>
  )
}
