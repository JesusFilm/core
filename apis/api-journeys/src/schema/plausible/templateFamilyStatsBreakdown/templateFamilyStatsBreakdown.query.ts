import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../../lib/auth/ability'
import { goals } from '../../../workers/plausible/service'
import { builder } from '../../builder'
import { IdType, JourneyStatus } from '../../journey/enums'
import { PlausibleStatsBreakdownFilter } from '../inputs'
import { loadJourneyOrThrow, normalizeIdType } from '../journeyAccess'
import {
  TemplateFamilyStatsBreakdownResponse,
  TemplateFamilyStatsBreakdownResponseRef
} from '../plausible'
import { getJourneyStatsBreakdown } from '../service'

import {
  UNKNOWN_JOURNEYS_AGGREGATE_ID,
  addPermissionsAndNames,
  filterPageVisitors,
  getJourneysResponses,
  transformBreakdownResults
} from './utils'
import { resolveStatsDateRange } from './utils/resolveStatsDateRange'

const PlausibleEventEnum = builder.enumType('PlausibleEvent', {
  values: [
    ...goals,
    'chatsClicked',
    'linksClicked',
    'journeyVisitors',
    'journeyResponses'
  ] as readonly string[]
})

export type JourneyWithAcl = Prisma.JourneyGetPayload<{
  select: {
    id: true
    slug: true
    title: true
    teamId: true
    status: true
    template: true
    userJourneys: true
    team: { include: { userTeams: true } }
  }
}>

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
      }),
      status: t.arg({
        type: [JourneyStatus],
        required: false,
        description:
          'Filter results to only include the specified status. If null or empty, all statuses are returned.'
      })
    },
    resolve: async (
      _parent,
      { id, idType, where, events, status },
      context
    ): Promise<TemplateFamilyStatsBreakdownResponse[]> => {
      const templateJourney = await loadJourneyOrThrow(
        id,
        normalizeIdType(idType)
      )
      if (templateJourney.deletedAt != null) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
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

      const dateRange = resolveStatsDateRange(where, templateJourney.createdAt)
      const plausibleFilter = {
        ...where,
        period: 'custom',
        date: dateRange.date
      }
      const allowedEvents =
        events != null && events.length > 0 ? new Set(events) : null
      const shouldIncludeJourneyVisitors =
        allowedEvents == null || allowedEvents.has('journeyVisitors')
      const shouldIncludeJourneyResponses =
        allowedEvents == null || allowedEvents.has('journeyResponses')

      // Only the caller's memberships are needed for ACL checks. Avoid fetching full journey content.
      const journeys = await prisma.journey.findMany({
        where: {
          fromTemplateId: templateJourney.id,
          deletedAt: null,
          ...(status != null && status.length > 0
            ? { status: { in: status } }
            : { status: { notIn: ['trashed', 'deleted'] } })
        },
        select: {
          id: true,
          slug: true,
          title: true,
          teamId: true,
          status: true,
          template: true,
          userJourneys: { where: { userId: context.user.id } },
          team: {
            include: { userTeams: { where: { userId: context.user.id } } }
          }
        },
        orderBy: { id: 'asc' }
      })
      if (journeys.length === 0) return []

      const templateSiteId = `api-journeys-template-${templateJourney.id}`
      // Page through both breakdowns so global totals include the whole family.
      const [breakdownResults, pageVisitors] = await Promise.all([
        getJourneyStatsBreakdown(
          templateJourney.id,
          {
            ...plausibleFilter,
            property: 'event:props:templateKey',
            metrics: 'visitors'
          },
          templateSiteId,
          { paginate: true }
        ),
        shouldIncludeJourneyVisitors
          ? getJourneyStatsBreakdown(
              templateJourney.id,
              {
                ...plausibleFilter,
                property: 'event:page',
                metrics: 'visitors'
              },
              templateSiteId,
              { paginate: true }
            )
          : Promise.resolve([])
      ])
      const transformedResults = transformBreakdownResults(
        breakdownResults,
        events
      )

      const filteredPageVisitors = shouldIncludeJourneyVisitors
        ? filterPageVisitors(pageVisitors, journeys)
        : []
      const journeysResponses = shouldIncludeJourneyResponses
        ? await getJourneysResponses(journeys, dateRange.responseDateRange)
        : []

      const visitorsByJourneyId = new Map(
        filteredPageVisitors.map((item) => [item.journeyId, item.visitors])
      )

      const responsesByJourneyId = new Map(
        journeysResponses.map((item) => [item.journeyId, item.visitors])
      )

      const unreadableJourneyIds = new Set(
        journeys
          .filter(
            (journey) =>
              !ability(Action.Read, subject('Journey', journey), context.user)
          )
          .map((journey) => journey.id)
      )

      // Include the full family even when Plausible has no activity in this range.
      const resultsByJourneyId = new Map(
        transformedResults.map((result) => [result.journeyId, result])
      )
      const familyResults = journeys.map(
        (journey) =>
          resultsByJourneyId.get(journey.id) ?? {
            journeyId: journey.id,
            stats: []
          }
      )

      const resultsWithPermissions = addPermissionsAndNames(
        familyResults,
        journeys,
        context.user
      )

      return resultsWithPermissions.map((result) => {
        const stats = [...result.stats]

        const journeyVisitorsCount =
          result.journeyId === UNKNOWN_JOURNEYS_AGGREGATE_ID
            ? Array.from(unreadableJourneyIds).reduce(
                (sum, journeyId) =>
                  sum + (visitorsByJourneyId.get(journeyId) ?? 0),
                0
              )
            : visitorsByJourneyId.get(result.journeyId)
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

        const responsesCount =
          result.journeyId === UNKNOWN_JOURNEYS_AGGREGATE_ID
            ? Array.from(unreadableJourneyIds).reduce(
                (sum, journeyId) =>
                  sum + (responsesByJourneyId.get(journeyId) ?? 0),
                0
              )
            : responsesByJourneyId.get(result.journeyId)
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
