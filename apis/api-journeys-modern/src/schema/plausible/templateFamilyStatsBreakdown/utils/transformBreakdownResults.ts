import {
  PlausibleStatsResponse,
  TemplateFamilyStatsEventResponse
} from '../../plausible'

export interface TransformedResult {
  journeyId: string
  stats: TemplateFamilyStatsEventResponse[]
}

/**
 * Transforms Plausible breakdown results by grouping events by journey ID and aggregating statistics.
 * Merges events with the same event type by summing their visitor counts. Calculates aggregated
 * events for chatsClicked and linksClicked based on event targets. If an events filter is provided,
 * ensures all filtered events are included with 0 visitors if they don't exist in the results.
 *
 * @param breakdownResults - Array of Plausible stats responses with JSON property data containing journeyId, event, and target
 * @param eventsFilter - Optional array of event names to filter. If null or empty, all events are included.
 * @returns Array of transformed results grouped by journey ID. Returns an empty array if breakdownResults is empty.
 *          If eventsFilter is provided, filtered events that don't exist in results will have 0 visitors.
 */
export function transformBreakdownResults(
  breakdownResults: PlausibleStatsResponse[],
  eventsFilter?: Array<string> | null
): TransformedResult[] {
  const allowedEvents =
    eventsFilter != null && eventsFilter.length > 0
      ? new Set(eventsFilter.map((e) => String(e)))
      : null

  const grouped = breakdownResults.reduce(
    (
      acc: Record<
        string,
        {
          events: Record<string, number>
          chatsClicked: number
          linksClicked: number
        }
      >,
      result
    ) => {
      try {
        const propertyData = JSON.parse(result.property)

        const journeyId = propertyData.journeyId
        const event = propertyData.event
        const target = propertyData.target

        if (journeyId == null || event == null) {
          return acc
        }

        if (allowedEvents != null && !allowedEvents.has(String(event))) {
          return acc
        }

        const visitors = result.visitors ?? 0

        if (!acc[journeyId]) {
          acc[journeyId] = {
            events: {},
            chatsClicked: 0,
            linksClicked: 0
          }
        }

        acc[journeyId].events[event] =
          (acc[journeyId].events[event] ?? 0) + visitors

        if (
          target === 'chat' ||
          (target != null && target.startsWith('chat:'))
        ) {
          acc[journeyId].chatsClicked += visitors
          if (allowedEvents == null || allowedEvents.has('chatsClicked')) {
            acc[journeyId].events['chatsClicked'] =
              (acc[journeyId].events['chatsClicked'] ?? 0) + visitors
          }
        }

        if (
          target === 'link' ||
          (target != null && target.startsWith('link:'))
        ) {
          acc[journeyId].linksClicked += visitors
          if (allowedEvents == null || allowedEvents.has('linksClicked')) {
            acc[journeyId].events['linksClicked'] =
              (acc[journeyId].events['linksClicked'] ?? 0) + visitors
          }
        }

        return acc
      } catch {
        return acc
      }
    },
    {} as Record<
      string,
      {
        events: Record<string, number>
        chatsClicked: number
        linksClicked: number
      }
    >
  )

  return Object.entries(grouped).map(([journeyId, data]) => {
    const stats = Object.entries(data.events).map(([eventType, visitors]) => ({
      event: eventType as TemplateFamilyStatsEventResponse['event'],
      visitors
    }))

    if (allowedEvents != null) {
      const existingEventTypes = new Set(
        stats.map((stat) => String(stat.event))
      )

      for (const eventType of allowedEvents) {
        if (!existingEventTypes.has(String(eventType))) {
          stats.push({
            event: eventType as TemplateFamilyStatsEventResponse['event'],
            visitors: 0
          })
        }
      }
    }

    return {
      journeyId,
      stats
    }
  })
}
