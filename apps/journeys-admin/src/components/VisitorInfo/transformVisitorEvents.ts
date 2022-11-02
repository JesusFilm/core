import reduce from 'lodash/reduce'
import { GetVisitorEvents_visitor_events as Event } from '../../../__generated__/GetVisitorEvents'

export interface JourneyWithEvents {
  id: string
  title?: string | null
  subtitle?: string
  createdAt?: string
  events: Event[]
}

export function transformVisitorEvents(
  events: Event[] = [],
  limit?: number
): JourneyWithEvents[] {
  const journeys = reduce(
    events,
    (result, event) => {
      let journey: JourneyWithEvents | undefined = result.find(
        ({ id }) => id === event.journeyId
      )
      if (journey == null) {
        journey = { id: event.journeyId, events: [] }
        result.push(journey)
      }
      if (event.__typename === 'JourneyViewEvent') {
        journey.title = event.label
        journey.subtitle = event.language?.name[0].value
        journey.createdAt = event.createdAt
      } else {
        journey.events.push(event)
      }
      return result
    },
    [] as JourneyWithEvents[]
  )
  if (limit != null) journeys.length = Math.min(journeys.length, limit)

  return journeys
}
