import {
  PlausibleStatsResponse,
  TemplateFamilyStatsEventResponse
} from '../../plausible'

export interface TransformedResult {
  journeyId: string
  stats: TemplateFamilyStatsEventResponse[]
}

/**
 * Maps raw Plausible event names to their corresponding "Capture" event names.
 * This mapping is needed because Plausible stores events with their raw names (e.g., "decisionForChrist"),
 * but the API expects the "Capture" variant (e.g., "christDecisionCapture").
 */
const EVENT_TO_CAPTURE_MAP: Record<string, string> = {
  decisionForChrist: 'christDecisionCapture',
  gospelPresentationStart: 'gospelStartCapture',
  gospelPresentationComplete: 'gospelCompleteCapture',
  prayerRequest: 'prayerRequestCapture',
  rsvp: 'rsvpCapture',
  specialVideoStart: 'specialVideoStartCapture',
  specialVideoComplete: 'specialVideoCompleteCapture',
  custom1: 'custom1Capture',
  custom2: 'custom2Capture',
  custom3: 'custom3Capture'
}

/**
 * Maps a raw event name to its "Capture" equivalent if a mapping exists, otherwise returns the original event name.
 */
function mapEventToCapture(event: string): string {
  return EVENT_TO_CAPTURE_MAP[event] ?? event
}

/**
 * Transforms Plausible breakdown results by grouping events by journey ID and aggregating statistics.
 * Merges events with the same event type by summing their visitor counts. Calculates aggregated
 * events for chatsClicked and linksClicked based on event targets. If an events filter is provided,
 * filters the final results and ensures all filtered events are included with 0 visitors if they don't exist.
 *
 * Note: All events are processed and aggregated first, then filtered. This ensures derived events
 * (chatsClicked, linksClicked) can be correctly calculated even when only derived events are in the filter.
 * Raw events are mapped to their "Capture" equivalents before filtering to match the expected event names.
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
    (acc: Record<string, { events: Record<string, number> }>, result) => {
      try {
        const propertyData = JSON.parse(result.property)

        const journeyId = propertyData.journeyId
        const event = propertyData.event
        const target = propertyData.target

        if (journeyId == null || event == null) {
          return acc
        }

        const visitors = result.visitors ?? 0

        if (!acc[journeyId]) {
          acc[journeyId] = {
            events: {}
          }
        }

        // Map raw event to "Capture" equivalent if mapping exists
        const mappedEvent = mapEventToCapture(event)
        const previousEventCount = acc[journeyId].events[mappedEvent] ?? 0
        acc[journeyId].events[mappedEvent] = previousEventCount + visitors

        if (
          target === 'chat' ||
          (target != null && target.startsWith('chat:'))
        ) {
          const previousChatsCount = acc[journeyId].events['chatsClicked'] ?? 0
          acc[journeyId].events['chatsClicked'] = previousChatsCount + visitors
        }

        if (
          target === 'link' ||
          (target != null && target.startsWith('link:'))
        ) {
          const previousLinksCount = acc[journeyId].events['linksClicked'] ?? 0
          acc[journeyId].events['linksClicked'] = previousLinksCount + visitors
        }

        return acc
      } catch (error) {
        console.error('[transformBreakdownResults] Error parsing property:', {
          property: result.property,
          error
        })
        return acc
      }
    },
    {} as Record<string, { events: Record<string, number> }>
  )

  const result = Object.entries(grouped).map(([journeyId, data]) => {
    let stats = Object.entries(data.events).map(([eventType, visitors]) => ({
      event: eventType as TemplateFamilyStatsEventResponse['event'],
      visitors
    }))

    if (allowedEvents != null) {
      stats = stats.filter((stat) => allowedEvents.has(String(stat.event)))

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

  return result
}
