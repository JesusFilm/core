import { ReactElement } from 'react'
import Timeline from '@mui/lab/Timeline'
import { GetVisitorEvents_visitor_events as Event } from '../../../../__generated__/GetVisitorEvents'
import { VisitorJourneyTimelineItem } from './VisitorJourneyTimelineItem'

interface Props {
  events: Event[]
  variant?: 'compact'
}

export function VisitorJourneyTimeline({
  events,
  variant
}: Props): ReactElement {
  let filter: Array<Event['__typename']> = [
    'ButtonClickEvent',
    'RadioQuestionSubmissionEvent',
    'TextResponseSubmissionEvent',
    'VideoCompleteEvent',
    'VideoStartEvent',
    'SignUpSubmissionEvent'
  ]
  if (variant === 'compact') {
    filter = ['TextResponseSubmissionEvent', 'RadioQuestionSubmissionEvent']
  }

  return (
    <Timeline
      sx={{
        m: 0,
        p: 0
      }}
    >
      {events
        .filter((item) => filter == null || filter.includes(item.__typename))
        .map((item) => (
          <VisitorJourneyTimelineItem
            key={item.id}
            event={item}
            variant={variant}
          />
        ))}
    </Timeline>
  )
}
