import { forEachRight } from 'lodash'
import parseISO from 'date-fns/parseISO'
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

export interface EventWithDuration {
  event: Event
  duration?: string
}

export function transformEvents(
  events: Event[]
): Array<EventWithDuration | EventWithDuration[]> {
  const featured: Array<Event['__typename']> = [
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'RadioQuestionSubmissionEvent'
  ]

  const compact: Array<Event['__typename']> = [
    'ButtonClickEvent',
    'VideoCompleteEvent',
    'VideoStartEvent',
    'SignUpSubmissionEvent'
  ]

  const filteredEvents = events.filter(
    (event) =>
      featured.includes(event.__typename) || compact.includes(event.__typename)
  )

  const eventsWithDuration: EventWithDuration[] = []
  filteredEvents.forEach((event, i) => {
    eventsWithDuration.push({ event })
    if (i - 1 >= 0) {
      const duration = getDuration(
        filteredEvents[i].createdAt,
        filteredEvents[i - 1].createdAt
      )

      eventsWithDuration[i - 1] = {
        ...eventsWithDuration[i - 1],
        duration
      }
    }
  })

  const result: Array<EventWithDuration | EventWithDuration[]> = []
  let pointer = 0

  forEachRight(eventsWithDuration, ({ event }) => {
    if (featured.includes(event.__typename)) {
      if (result[pointer] != null) pointer++
      result.push({ event })
      pointer++
    } else if (compact.includes(event.__typename)) {
      const nestedEvent = result[pointer]
      if (nestedEvent == null) {
        result.push([{ event }])
      } else if (Array.isArray(nestedEvent)) {
        nestedEvent.push({ event })
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
