import { GraphQLError } from 'graphql'

import {
  Prisma,
  JourneyStatus as PrismaJourneyStatus,
  prisma
} from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { IdType } from '../../journey/enums'
import { PlausibleStatsAggregateFilter } from '../inputs'
import { loadJourneyOrThrow, normalizeIdType } from '../journeyAccess'
import {
  PlausibleStatsResponse,
  TemplateFamilyStatsAggregateResponse,
  TemplateFamilyStatsAggregateResponseRef
} from '../plausible'
import { getJourneyStatsBreakdown } from '../service'

export type JourneyWithAcl = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: {
      include: { userTeams: true }
    }
  }
}>

builder.queryField('templateFamilyStatsAggregate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: TemplateFamilyStatsAggregateResponseRef,
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({
        type: IdType,
        required: false,
        defaultValue: 'slug'
      }),
      where: t.arg({
        type: PlausibleStatsAggregateFilter,
        required: true
      })
    },
    resolve: async (
      _parent,
      { id, idType, where },
      context
    ): Promise<TemplateFamilyStatsAggregateResponse> => {
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

      let totalJourneysViews = 0
      let breakdownResults: PlausibleStatsResponse[] = []
      if (templateJourney.templateSite === true) {
        const templateSiteId = `api-journeys-template-${templateJourney.id}`
        breakdownResults = await getJourneyStatsBreakdown(
          templateJourney.id,
          {
            ...where,
            property: 'event:page',
            metrics: 'visitors'
          },
          templateSiteId
        )
      }

      const { childJourneys, totalJourneysResponses, childJourneysCount } =
        await getTotalJourneysResponses(templateJourney.id)
      totalJourneysViews = transformBreakdownResults(
        breakdownResults,
        childJourneys
      )

      return {
        childJourneysCount,
        totalJourneysViews,
        totalJourneysResponses
      }
    }
  })
)

function transformBreakdownResults(
  breakdownResults: PlausibleStatsResponse[],
  childJourneys: Array<
    Prisma.JourneyGetPayload<{ select: { id: true; status: true } }>
  >
): number {
  const journeyIdToJourney = new Map(
    childJourneys.map((journey) => [journey.id, journey])
  )

  const journeyIdMaxVisitors = new Map<string, number>()

  for (const result of breakdownResults) {
    const property = result.property ?? ''

    if (property.startsWith('/')) {
      const afterFirstSlash = property.slice(1)
      const nextSlashIndex = afterFirstSlash.indexOf('/')
      const journeyId =
        nextSlashIndex === -1
          ? afterFirstSlash
          : afterFirstSlash.slice(0, nextSlashIndex)
      if (!journeyId) continue

      const journey = journeyIdToJourney.get(journeyId)
      if (
        journey == null ||
        journey.status === PrismaJourneyStatus.trashed ||
        journey.status === PrismaJourneyStatus.deleted
      ) {
        continue
      }

      const visitors = result.visitors ?? 0
      const currentMax = journeyIdMaxVisitors.get(journeyId) ?? 0
      journeyIdMaxVisitors.set(journeyId, Math.max(currentMax, visitors))
    }
  }

  const totalJourneysViews = Array.from(journeyIdMaxVisitors.values()).reduce(
    (sum, maxVisitors) => sum + maxVisitors,
    0
  )

  return totalJourneysViews
}

async function getTotalJourneysResponses(templateId: string): Promise<{
  childJourneys: Array<
    Prisma.JourneyGetPayload<{ select: { id: true; status: true } }>
  >
  totalJourneysResponses: number
  childJourneysCount: number
}> {
  const childJourneys = await prisma.journey.findMany({
    where: {
      fromTemplateId: templateId,
      status: {
        notIn: [PrismaJourneyStatus.trashed, PrismaJourneyStatus.deleted]
      }
    },
    select: {
      id: true,
      status: true
    }
  })

  if (childJourneys.length === 0) {
    return {
      childJourneys,
      totalJourneysResponses: 0,
      childJourneysCount: 0
    }
  }

  const journeyIds = childJourneys.map((journey) => journey.id)
  const childJourneysCount = journeyIds.length

  const results = await prisma.journeyVisitor.groupBy({
    by: ['journeyId'],
    where: {
      journeyId: { in: journeyIds },
      lastTextResponse: { not: null },
      journey: {
        status: {
          notIn: [PrismaJourneyStatus.trashed, PrismaJourneyStatus.deleted]
        }
      }
    },
    _count: {
      journeyId: true
    }
  })
  const totalJourneysResponses = results.reduce(
    (total, result) => total + (result._count.journeyId ?? 0),
    0
  )

  return {
    childJourneys,
    totalJourneysResponses,
    childJourneysCount
  }
}
