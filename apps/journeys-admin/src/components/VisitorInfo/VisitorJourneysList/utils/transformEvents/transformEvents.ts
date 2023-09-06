import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import parseISO from 'date-fns/parseISO'
import forEachRight from 'lodash/forEachRight'

import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

export interface TimelineItem {
  event: Event
  duration?: string
}

interface TransformedEvents {
  timelineItems: Array<TimelineItem | TimelineItem[]>
  totalDuration: string
}

export function transformEvents(events: Event[]): TransformedEvents {
  const sortedEvents = events.sort((a, b) => {
    if (a.createdAt < b.createdAt) {
      return -1
    } else if (a.createdAt > b.createdAt) {
      return 1
    } else return 0
  })

  const featured: Array<Event['__typename']> = [
    'JourneyViewEvent',
    'ChatOpenEvent',
    'TextResponseSubmissionEvent',
    'ButtonClickEvent',
    'RadioQuestionSubmissionEvent',
    'SignUpSubmissionEvent'
  ]

  const eventTypesFilter: Array<Event['__typename']> = [
    ...featured,
    'StepNextEvent',
    'StepViewEvent',
    'VideoStartEvent',
    'VideoPlayEvent',
    'VideoPauseEvent',
    'VideoProgressEvent',
    'VideoExpandEvent',
    'VideoCompleteEvent'
  ]

  const filteredEvents = sortedEvents.filter((event) =>
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

  const timelineItems: Array<TimelineItem | TimelineItem[]> = []
  let pointer = 0

  forEachRight(eventsWithDuration, (timelineEvent) => {
    if (featured.includes(timelineEvent.event.__typename)) {
      if (timelineItems[pointer] != null) pointer++
      timelineItems.push(timelineEvent)
      pointer++
    } else {
      const nestedEvent = timelineItems[pointer]
      if (nestedEvent == null) {
        timelineItems.push([timelineEvent])
      } else if (Array.isArray(nestedEvent)) {
        nestedEvent.push(timelineEvent)
      }
    }
  })

  return {
    timelineItems,
    totalDuration: getDuration(
      filteredEvents[0].createdAt,
      filteredEvents.slice(-1)[0].createdAt
    )
  }
}

export function getDuration(start: string, end: string): string {
  const durationInMilliseconds = differenceInMilliseconds(
    parseISO(end),
    parseISO(start)
  )

  const minutes = Math.floor((durationInMilliseconds % 3600000) / 60000)
  const seconds = Math.floor(((durationInMilliseconds % 360000) % 60000) / 1000)

  let result: string
  if (minutes === 0 && seconds === 0) {
    result = '< 0:01'
  } else if (seconds < 10) {
    result = `${minutes}:0${seconds}`
  } else {
    result = `${minutes}:${seconds}`
  }

  return result
}
