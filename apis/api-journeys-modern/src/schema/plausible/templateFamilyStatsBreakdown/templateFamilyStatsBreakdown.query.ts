import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../../lib/auth/ability'
import { goals } from '../../../workers/plausible/service'
import { builder } from '../../builder'
import { IdType } from '../../journey/enums'
import { PlausibleStatsBreakdownFilter } from '../inputs'
import { loadJourneyOrThrow, normalizeIdType } from '../journeyAccess'
import {
  TemplateFamilyStatsBreakdownResponse,
  TemplateFamilyStatsBreakdownResponseRef
} from '../plausible'
import { getJourneyStatsBreakdown } from '../service'

import {
  TransformedResult,
  addPermissionsAndNames,
  filterPageVisitors,
  getJourneysResponses,
  transformBreakdownResults
} from './utils'

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
  include: {
    userJourneys: true
    team: {
      include: { userTeams: true }
    }
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
      })
    },
    resolve: async (
      _parent,
      { id, idType, where, events },
      context
    ): Promise<TemplateFamilyStatsBreakdownResponse[]> => {
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
        ...new Set(
          transformedResults.map(
            (result: TransformedResult) => result.journeyId
          )
        )
      ]

      const allowedEvents =
        events != null && events.length > 0
          ? new Set(events.map((e) => String(e)))
          : null

      const shouldIncludeJourneyVisitors =
        allowedEvents == null || allowedEvents.has('journeyVisitors')
      const shouldIncludeJourneyResponses =
        allowedEvents == null || allowedEvents.has('journeyResponses')

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
        shouldIncludeJourneyVisitors
          ? getJourneyStatsBreakdown(
              templateJourney.id,
              {
                property: 'event:page',
                metrics: 'visitors'
              },
              templateSiteId
            )
          : Promise.resolve([])
      ])

      const filteredPageVisitors = shouldIncludeJourneyVisitors
        ? filterPageVisitors(pageVisitors, journeys)
        : []
      const journeysResponses = shouldIncludeJourneyResponses
        ? await getJourneysResponses(journeys)
        : []

      const visitorsByJourneyId = new Map(
        filteredPageVisitors.map((item) => [item.journeyId, item.visitors])
      )

      const responsesByJourneyId = new Map(
        journeysResponses.map((item) => [item.journeyId, item.visitors])
      )

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
