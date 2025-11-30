import { GraphQLError, GraphQLResolveInfo } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action, ability, subject } from '../../lib/auth/ability'
import { goals } from '../../workers/plausible/service'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { PlausibleStatsBreakdownFilter } from './inputs'
import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import { getMetrics } from './metrics'
import {
  PlausibleStatsResponse,
  TemplatePlausibleStatsBreakdownResponse,
  TemplatePlausibleStatsBreakdownResponseRef,
  TemplatePlausibleStatsEventResponse
} from './plausible'
import { getJourneyStatsBreakdown } from './service'

const PlausibleEventEnum = builder.enumType('PlausibleEvent', {
  values: goals as readonly string[]
})

builder.queryField('templatePlausibleStatsBreakdown', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [TemplatePlausibleStatsBreakdownResponseRef],
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        required: false,
        defaultValue: 'slug'
      }),
      where: t.arg({
        type: PlausibleStatsBreakdownFilter,
        required: true
      }),
      events: t.arg({
        type: [PlausibleEventEnum],
        required: false,
        description:
          'Filter results to only include the specified events. If null or empty, all events are returned.'
      })
    },
    resolve: async (
      _parent,
      { id, idType, where, events },
      context,
      info: GraphQLResolveInfo
    ): Promise<TemplatePlausibleStatsBreakdownResponse[]> => {
      if (context.type !== 'authenticated') {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }
      const templateJourney = await loadJourneyOrThrow(
        id,
        normalizeIdType(idType)
      )
      if (
        !ability(
          Action.Update,
          subject('Journey', templateJourney),
          context.user
        )
      ) {
        throw new GraphQLError('User is not allowed to view journey', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const metrics = getMetrics(info)
      const { property: _, ...whereWithoutProperty } = where
      const templateSiteId = `api-journeys-template-${templateJourney.id}`
      const breakdownResults = await getJourneyStatsBreakdown(
        templateJourney.id,
        {
          property: 'event:goal',
          metrics,
          ...whereWithoutProperty
        },
        templateSiteId
      )
      const transformedResults = transformBreakdownResults(
        breakdownResults,
        events
      )

      const journeyIds = [
        ...new Set(transformedResults.map((result) => result.journeyId))
      ]
      const journeys = await prisma.journey.findMany({
        where: { id: { in: journeyIds } },
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      })
      const resultsWithPermissions = addPermissionsAndNames(
        transformedResults,
        journeys,
        context.user
      )

      return resultsWithPermissions
    }
  })
)

interface TransformedResult {
  journeyId: string
  stats: TemplatePlausibleStatsEventResponse[]
}

function transformBreakdownResults(
  breakdownResults: PlausibleStatsResponse[],
  eventsFilter?: Array<string> | null
): TransformedResult[] {
  const allowedEvents =
    eventsFilter != null && eventsFilter.length > 0
      ? new Set(eventsFilter.map((e) => String(e)))
      : null

  const grouped = breakdownResults.reduce(
    (
      acc: Record<string, Array<{ eventType: string; visitors: number }>>,
      result
    ) => {
      try {
        const propertyData = JSON.parse(result.property)

        const journeyId = propertyData.journeyId
        const event = propertyData.event

        if (journeyId == null || event == null) {
          return acc
        }

        if (allowedEvents != null && !allowedEvents.has(String(event))) {
          return acc
        }

        const visitors = result.visitors ?? 0

        if (!acc[journeyId]) {
          acc[journeyId] = []
        }

        acc[journeyId].push({
          eventType: event,
          visitors
        })

        return acc
      } catch {
        return acc
      }
    },
    {} as Record<string, Array<{ eventType: string; visitors: number }>>
  )

  return Object.entries(grouped).map(([journeyId, events]) => ({
    journeyId,
    stats: events.map((event) => ({
      event: event.eventType as TemplatePlausibleStatsEventResponse['event'],
      visitors: event.visitors
    }))
  }))
}

type JourneyWithAcl = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: {
      include: { userTeams: true }
    }
  }
}>

function addPermissionsAndNames(
  transformedResults: TransformedResult[],
  journeys: JourneyWithAcl[],
  user: User
): TemplatePlausibleStatsBreakdownResponse[] {
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
