import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

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
      const templateSiteId = `api-journeys-template-${templateJourney.id}`
      const breakdownResults = await getJourneyStatsBreakdown(
        templateJourney.id,
        {
          ...where,
          property: 'event:page',
          metrics: 'visitors'
        },
        templateSiteId
      )

      const { childJourneysCount, totalJourneysViews } =
        transformBreakdownResults(breakdownResults)

      const totalJourneysResponses = await getTotalJourneysResponses(
        templateJourney.id
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
  breakdownResults: PlausibleStatsResponse[]
): { childJourneysCount: number; totalJourneysViews: number } {
  const uniqueSlugs = new Set<string>()
  let totalJourneysViews = 0

  for (const result of breakdownResults) {
    const property = result.property ?? ''
    const slashCount = (property.match(/\//g) ?? []).length

    if (slashCount === 1 && property.startsWith('/')) {
      const slug = property.slice(1)
      uniqueSlugs.add(slug)

      const visitors = result.visitors ?? 0
      totalJourneysViews += visitors
    }
  }

  return {
    childJourneysCount: uniqueSlugs.size ?? 0,
    totalJourneysViews: totalJourneysViews ?? 0
  }
}

async function getTotalJourneysResponses(templateId: string): Promise<number> {
  const childJourneys = await prisma.journey.findMany({
    where: {
      fromTemplateId: templateId
    },
    select: {
      id: true
    }
  })

  if (childJourneys.length === 0) {
    return 0
  }

  const journeyIds = childJourneys.map((journey) => journey.id)

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
  const childJourneysCount = results.reduce(
    (total, result) => total + (result._count.journeyId ?? 0),
    0
  )

  return childJourneysCount
}
