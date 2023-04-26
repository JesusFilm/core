import { forEachRight } from 'lodash'
import parseISO from 'date-fns/parseISO'
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

export interface TimelineItem {
  event: Event
  duration?: string
}

export function transformEvents(
  events: Event[]
): Array<TimelineItem | TimelineItem[]> {
  const featured: Array<Event['__typename']> = [
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'RadioQuestionSubmissionEvent',
    'JourneyViewEvent'
  ]

  const eventTypesFilter: Array<Event['__typename']> = [
    ...featured,
    'ButtonClickEvent',
    'VideoCompleteEvent',
    'VideoStartEvent',
    'SignUpSubmissionEvent'
  ]

  const filteredEvents = events.filter((event) =>
    eventTypesFilter.includes(event.__typename)
  )

  const eventsWithDuration: TimelineItem[] = []
  filteredEvents.forEach((event, i) => {
    eventsWithDuration.push({ event })
    if (i - 1 >= 0) {
      const duration = getDuration(
        filteredEvents[i - 1].createdAt,
        filteredEvents[i].createdAt
      )

      eventsWithDuration[i - 1] = {
        ...eventsWithDuration[i - 1],
        duration
      }
    }
  })

  const result: Array<TimelineItem | TimelineItem[]> = []
  let pointer = 0

  forEachRight(eventsWithDuration, (timelineEvent) => {
    if (featured.includes(timelineEvent.event.__typename)) {
      if (result[pointer] != null) pointer++
      result.push(timelineEvent)
      pointer++
    } else {
      const nestedEvent = result[pointer]
      if (nestedEvent == null) {
        result.push([timelineEvent])
      } else if (Array.isArray(nestedEvent)) {
        nestedEvent.push(timelineEvent)
      }
    }
  })

  return result
}

function getDuration(start: string, end: string): string {
  const durationInMilliseconds = differenceInMilliseconds(
    parseISO(end),
    parseISO(start)
  )

  const minutes = Math.floor((durationInMilliseconds % 3600000) / 60000)
  const seconds = Math.floor(((durationInMilliseconds % 360000) % 60000) / 1000)
  const secondsAsString =
    seconds > 0
      ? seconds < 10
        ? `0${seconds as unknown as string}`
        : (seconds as unknown as string)
      : '01'
  return `${seconds === 0 ? '<' : ''} ${
    minutes as unknown as string
  }:${secondsAsString}`
}
