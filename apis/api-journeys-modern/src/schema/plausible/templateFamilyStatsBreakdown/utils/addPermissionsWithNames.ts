import { User } from '@core/yoga/firebaseClient'

import { Action, ability, subject } from '../../../../lib/auth/ability'
import { TemplateFamilyStatsBreakdownResponse } from '../../plausible'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

import { TransformedResult } from './transformBreakdownResults'

/**
 * Adds journey and team names to transformed results based on user permissions.
 * Journeys the user can read will show their actual names, while inaccessible
 * journeys will be labeled as "unknown journey" with an index. Teams are similarly
 * labeled based on whether the user can access any journey in that team.
 *
 * @param transformedResults - The transformed breakdown results with journey IDs and stats
 * @param journeys - Array of journeys with ACL information
 * @param user - The current user for permission checking
 * @returns Array of breakdown responses with journey names, team names, and stats
 */
export function addPermissionsAndNames(
  transformedResults: TransformedResult[],
  journeys: JourneyWithAcl[],
  user: User
): TemplateFamilyStatsBreakdownResponse[] {
  const journeyById = new Map(journeys.map((journey) => [journey.id, journey]))
  const teamNameMap = buildTeamNameMap(journeys, user)

  let anonymousJourneyIndex = 0

  return transformedResults.map((transformedResult) => {
    const journey = journeyById.get(transformedResult.journeyId)

    if (journey == null) {
      anonymousJourneyIndex++
      return {
        journeyId: transformedResult.journeyId,
        journeyName: `unknown journey ${anonymousJourneyIndex}`,
        teamName: 'No Team',
        stats: transformedResult.stats
      }
    }

    const userCanReadJourney = ability(
      Action.Read,
      subject('Journey', journey),
      user
    )

    if (userCanReadJourney) {
      return {
        journeyId: transformedResult.journeyId,
        journeyName: journey.title ?? 'Untitled Journey',
        teamName: journey.team?.title ?? 'No Team',
        stats: transformedResult.stats
      }
    }

    anonymousJourneyIndex++
    return {
      journeyId: transformedResult.journeyId,
      journeyName: `unknown journey ${anonymousJourneyIndex}`,
      teamName: teamNameMap.get(journey.teamId) ?? 'No Team',
      stats: transformedResult.stats
    }
  })
}

/**
 * Builds a map of team IDs to team names based on user permissions.
 * If the user can read any journey in a team, the actual team name is used.
 * Otherwise, teams are labeled as "unknown team" with an index.
 *
 * @param journeys - Array of journeys with ACL information
 * @param user - The current user for permission checking
 * @returns Map of team ID (or null) to team name string
 */
function buildTeamNameMap(
  journeys: JourneyWithAcl[],
  user: User
): Map<string | null, string> {
  const teamNameMap = new Map<string | null, string>()
  const teamIdToJourneys = new Map<string, JourneyWithAcl[]>()

  for (const journey of journeys) {
    if (journey.teamId == null) {
      teamNameMap.set(null, 'No Team')
      continue
    }

    if (!teamIdToJourneys.has(journey.teamId)) {
      teamIdToJourneys.set(journey.teamId, [])
    }
    teamIdToJourneys.get(journey.teamId)!.push(journey)
  }

  let anonymousTeamIndex = 0
  for (const [teamId, teamJourneys] of teamIdToJourneys.entries()) {
    const userCanReadAnyJourneyInTeam = teamJourneys.some((journey) =>
      ability(Action.Read, subject('Journey', journey), user)
    )

    if (userCanReadAnyJourneyInTeam) {
      const teamName = teamJourneys[0].team?.title ?? 'No Team'
      teamNameMap.set(teamId, teamName)
    } else {
      anonymousTeamIndex++
      teamNameMap.set(teamId, `unknown team ${anonymousTeamIndex}`)
    }
  }

  return teamNameMap
}
