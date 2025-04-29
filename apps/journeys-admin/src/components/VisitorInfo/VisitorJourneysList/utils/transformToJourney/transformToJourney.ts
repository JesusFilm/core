import reduce from 'lodash/reduce'

import { GetVisitorEvents_visitor_events as Event } from '../../../../../../__generated__/GetVisitorEvents'

export interface JourneyWithEvents {
  id: string
  title?: string | null
  subtitle?: string
  createdAt?: string
  events: Event[]
}

export function transformToJourney(events: Event[] = []): JourneyWithEvents[] {
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
        journey.subtitle = event.language?.name?.[0]?.value ?? undefined
        journey.createdAt = event.createdAt
      }
      journey.events.push(event)
      return result
    },
    [] as JourneyWithEvents[]
  )

  return journeys.reverse()
}
