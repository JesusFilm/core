import { User } from '@core/yoga/firebaseClient'

import { Action, ability, subject } from '../../../../lib/auth/ability'
import {
  TemplateFamilyStatsBreakdownResponse,
  TemplateFamilyStatsEventResponse
} from '../../plausible'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

import { TransformedResult } from './transformBreakdownResults'

export const UNKNOWN_JOURNEYS_AGGREGATE_ID = '__unknown_journeys__'

/**
 * Adds journey and team names to transformed results based on user permissions.
 * Journeys the user can read will show their actual names.
 *
 * Journeys the user cannot read are aggregated into a single "unknown" row
 * (instead of splitting them into separate unknown journeys/teams).
 *
 * Filters out results for journeys that cannot be matched.
 *
 * Also includes journeys with only responses (no Plausible stats) if provided.
 *
 * @param transformedResults - The transformed breakdown results with journey IDs and stats
 * @param journeys - Array of journeys with ACL information
 * @param user - The current user for permission checking
 * @param options - Optional configuration
 * @param options.responsesByJourneyId - Map of journey IDs to response counts for journeys with only responses
 * @param options.allowedEvents - Set of allowed event names to filter by
 * @returns Array of breakdown responses with journey names, team names, and stats
 */
export function addPermissionsAndNames(
  transformedResults: TransformedResult[],
  journeys: JourneyWithAcl[],
  user: User,
  options?: {
    responsesByJourneyId?: Map<string, number>
    allowedEvents?: Set<string> | null
  }
): TemplateFamilyStatsBreakdownResponse[] {
  const journeyById = new Map(journeys.map((journey) => [journey.id, journey]))

  const results: TemplateFamilyStatsBreakdownResponse[] = []

  const unknownStatsByEvent = new Map<string, number>()
  const unknownEventOrder: string[] = []
  let hasUnknownJourneys = false

  for (const transformedResult of transformedResults) {
    const journey = journeyById.get(transformedResult.journeyId)
    // Filter out events where we can't match a journey
    if (journey == null) continue

    const userCanReadJourney = ability(
      Action.Read,
      subject('Journey', journey),
      user
    )

    if (userCanReadJourney) {
      results.push({
        journeyId: transformedResult.journeyId,
        journeyName: journey.title ?? 'Untitled Journey',
        teamName: journey.team?.title ?? 'No Team',
        status: journey.status,
        stats: transformedResult.stats
      })
      continue
    }

    // Aggregate unreadable journeys into a single row
    hasUnknownJourneys = true
    mergeStatsIntoAggregate(
      transformedResult.stats,
      unknownStatsByEvent,
      unknownEventOrder
    )
  }

  if (hasUnknownJourneys) {
    results.push({
      journeyId: UNKNOWN_JOURNEYS_AGGREGATE_ID,
      journeyName: 'Unknown journeys',
      teamName: 'Unknown teams',
      // Aggregated row can contain mixed statuses; don't report a single status.
      status: null,
      stats: unknownEventOrder.map((event) => ({
        event: event as TemplateFamilyStatsEventResponse['event'],
        visitors: unknownStatsByEvent.get(event) ?? 0
      }))
    })
  }

  // Add journeys with only responses (no Plausible stats)
  if (options?.responsesByJourneyId != null) {
    const journeyIdsWithPlausibleStats = new Set(
      results
        .filter((result) => result.journeyId !== UNKNOWN_JOURNEYS_AGGREGATE_ID)
        .map((result) => result.journeyId)
    )

    const allowedEvents = options.allowedEvents
    const shouldIncludeJourneyResponses =
      allowedEvents == null || allowedEvents.has('journeyResponses')

    if (shouldIncludeJourneyResponses) {
      for (const journey of journeys) {
        const hasPlausibleStats = journeyIdsWithPlausibleStats.has(journey.id)
        const responsesCount = options.responsesByJourneyId.get(journey.id) ?? 0

        if (
          !hasPlausibleStats &&
          responsesCount > 0 &&
          ability(Action.Read, subject('Journey', journey), user)
        ) {
          results.push({
            journeyId: journey.id,
            journeyName: journey.title ?? 'Untitled Journey',
            teamName: journey.team?.title ?? 'No Team',
            status: journey.status,
            stats: [
              {
                event: 'journeyResponses',
                visitors: responsesCount
              }
            ]
          })
        }
      }
    }
  }

  return results
}

function mergeStatsIntoAggregate(
  stats: TemplateFamilyStatsEventResponse[],
  visitorsByEvent: Map<string, number>,
  eventOrder: string[]
): void {
  for (const stat of stats) {
    const event = String(stat.event)
    if (!visitorsByEvent.has(event)) {
      eventOrder.push(event)
    }
    visitorsByEvent.set(
      event,
      (visitorsByEvent.get(event) ?? 0) + stat.visitors
    )
  }
}
