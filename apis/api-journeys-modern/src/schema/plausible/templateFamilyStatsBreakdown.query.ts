import { GraphQLError, GraphQLResolveInfo } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action, ability, subject } from '../../lib/auth/ability'
import { goals } from '../../workers/plausible/service'
import { builder } from '../builder'
import { IdType } from '../journey/enums'

import { PlausibleStatsBreakdownFilter } from './inputs'
import { loadJourneyOrThrow, normalizeIdType } from './journeyAccess'
import {
  PlausibleStatsResponse,
  TemplateFamilyStatsBreakdownResponse,
  TemplateFamilyStatsBreakdownResponseRef,
  TemplateFamilyStatsEventResponse
} from './plausible'
import { getJourneyStatsBreakdown } from './service'

const PlausibleEventEnum = builder.enumType('PlausibleEvent', {
  values: [
    ...goals,
    'chatsClicked',
    'linksClicked',
    'journeyVisitors',
    'journeyResponses'
  ] as readonly string[]
})

builder.queryField('templateFamilyStatsBreakdown', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [TemplateFamilyStatsBreakdownResponseRef],
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
    ): Promise<TemplateFamilyStatsBreakdownResponse[]> => {
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

      const { property: _, ...whereWithoutProperty } = where
      const templateSiteId = `template-site`
      // const templateSiteId = `api-journeys-template-${templateJourney.id}`

      const breakdownResults = await getJourneyStatsBreakdown(
        templateJourney.id,
        {
          property: 'event:props:templateKey',
          metrics: 'visitors',
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

      const [journeys, pageVisitors] = await Promise.all([
        prisma.journey.findMany({
          where: { id: { in: journeyIds } },
          include: {
            userJourneys: true,
            team: {
              include: { userTeams: true }
            }
          }
        }),
        getJourneyStatsBreakdown(
          templateJourney.id,
          {
            property: 'event:page',
            metrics: 'visitors'
          },
          templateSiteId
        )
      ])

      const filteredPageVisitors = filterPageVisitors(pageVisitors, journeys)
      const journeysResponses = await getJourneysResponses(journeys)

      const visitorsByJourneyId = new Map(
        filteredPageVisitors.map((item) => [item.journeyId, item.visitors])
      )

      const responsesByJourneyId = new Map(
        journeysResponses.map((item) => [item.journeyId, item.visitors])
      )

      const allowedEvents =
        events != null && events.length > 0
          ? new Set(events.map((e) => String(e)))
          : null

      const resultsWithPermissions = addPermissionsAndNames(
        transformedResults,
        journeys,
        context.user
      )

      return resultsWithPermissions.map((result) => {
        const stats = [...result.stats]

        const journeyVisitorsCount = visitorsByJourneyId.get(result.journeyId)
        if (allowedEvents == null || allowedEvents.has('journeyVisitors')) {
          const existingIndex = stats.findIndex(
            (stat) => stat.event === 'journeyVisitors'
          )
          const visitors = journeyVisitorsCount ?? 0
          if (existingIndex >= 0) {
            stats[existingIndex] = {
              event: 'journeyVisitors',
              visitors
            }
          } else {
            stats.push({
              event: 'journeyVisitors',
              visitors
            })
          }
        }

        const responsesCount = responsesByJourneyId.get(result.journeyId)
        if (allowedEvents == null || allowedEvents.has('journeyResponses')) {
          const existingIndex = stats.findIndex(
            (stat) => stat.event === 'journeyResponses'
          )
          const visitors = responsesCount ?? 0
          if (existingIndex >= 0) {
            stats[existingIndex] = {
              event: 'journeyResponses',
              visitors
            }
          } else {
            stats.push({
              event: 'journeyResponses',
              visitors
            })
          }
        }

        return {
          ...result,
          stats
        }
      })
    }
  })
)

interface TransformedResult {
  journeyId: string
  stats: TemplateFamilyStatsEventResponse[]
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

        // Merge events with the same eventType by summing their visitors
        acc[journeyId].events[event] =
          (acc[journeyId].events[event] ?? 0) + visitors

        // Aggregate chatsClicked and linksClicked based on target
        if (
          target === 'chat' ||
          (target != null && target.startsWith('chat:'))
        ) {
          acc[journeyId].chatsClicked += visitors
          // Add to events if filter allows it
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
          // Add to events if filter allows it
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
    // Convert merged events to stats array
    const stats = Object.entries(data.events).map(([eventType, visitors]) => ({
      event: eventType as TemplateFamilyStatsEventResponse['event'],
      visitors
    }))

    // If there's a filter, ensure all filtered events are included (with 0 if missing)
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

function filterPageVisitors(
  pageVisitors: PlausibleStatsResponse[],
  journeys: JourneyWithAcl[]
): { journeyId: string; visitors: number }[] {
  const journeySlugMap = new Map<string, string>()
  for (const journey of journeys) {
    journeySlugMap.set(journey.slug, journey.id)
  }

  const journeyVisitorsMap = new Map<string, number>()

  for (const pageVisitor of pageVisitors) {
    const property = pageVisitor.property ?? ''

    const slashCount = (property.match(/\//g) ?? []).length

    if (slashCount > 1) {
      continue
    }

    if (slashCount === 1 && property.startsWith('/')) {
      const slug = property.slice(1)
      const journeyId = journeySlugMap.get(slug)

      if (journeyId != null) {
        const visitors = pageVisitor.visitors ?? 0
        journeyVisitorsMap.set(
          journeyId,
          (journeyVisitorsMap.get(journeyId) ?? 0) + visitors
        )
      }
    }
  }

  return Array.from(journeyVisitorsMap.entries()).map(
    ([journeyId, visitors]) => ({
      journeyId,
      visitors
    })
  )
}

async function getJourneysResponses(
  journeys: JourneyWithAcl[]
): Promise<{ journeyId: string; visitors: number }[]> {
  if (journeys.length === 0) {
    return []
  }

  const journeyIds = journeys.map((journey) => journey.id)

  const results = await prisma.journeyVisitor.groupBy({
    by: ['journeyId'],
    where: {
      journeyId: { in: journeyIds },
      lastTextResponse: { not: null }
    },
    _count: {
      journeyId: true
    }
  })

  return results.map((result) => ({
    journeyId: result.journeyId,
    visitors: result._count.journeyId
  }))
}
