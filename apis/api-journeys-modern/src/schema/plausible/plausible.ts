import { GraphQLError, GraphQLResolveInfo, Kind, SelectionNode } from 'graphql'
import pull from 'lodash/pull'
import snakeCase from 'lodash/snakeCase'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { IdType } from '../journey/enums/idType'

interface PlausibleStatsAggregateValue {
  value: number
  change?: number | null
}

interface PlausibleStatsAggregateResponse {
  visitors: PlausibleStatsAggregateValue
  visits: PlausibleStatsAggregateValue
  pageviews: PlausibleStatsAggregateValue
  viewsPerVisit: PlausibleStatsAggregateValue
  bounceRate: PlausibleStatsAggregateValue
  visitDuration: PlausibleStatsAggregateValue
  events: PlausibleStatsAggregateValue
  conversionRate: PlausibleStatsAggregateValue
  timeOnPage: PlausibleStatsAggregateValue
}

interface PlausibleStatsResponse {
  property: string
  visitors?: number | null
  visits?: number | null
  pageviews?: number | null
  viewsPerVisit?: number | null
  bounceRate?: number | null
  visitDuration?: number | null
  events?: number | null
  conversionRate?: number | null
  timeOnPage?: number | null
}

export const PlausibleStatsAggregateValueRef = builder
  .objectRef<PlausibleStatsAggregateValue>('PlausibleStatsAggregateValue')
  .implement({
    shareable: true,
    fields: (t) => ({
      value: t.float({
        nullable: false,
        resolve: (parent) => parent.value
      }),
      change: t.int({
        nullable: true,
        resolve: (parent) => parent.change
      })
    })
  })

export const PlausibleStatsAggregateResponseRef = builder
  .objectRef<PlausibleStatsAggregateResponse>('PlausibleStatsAggregateResponse')
  .implement({
    shareable: true,
    fields: (t) => ({
      visitors: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.visitors
      }),
      visits: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.visits
      }),
      pageviews: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.pageviews
      }),
      viewsPerVisit: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.viewsPerVisit
      }),
      bounceRate: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.bounceRate
      }),
      visitDuration: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.visitDuration
      }),
      events: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.events
      }),
      conversionRate: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.conversionRate
      }),
      timeOnPage: t.field({
        type: PlausibleStatsAggregateValueRef,
        resolve: (parent) => parent.timeOnPage
      })
    })
  })

export const PlausibleStatsResponseRef = builder
  .objectRef<PlausibleStatsResponse>('PlausibleStatsResponse')
  .implement({
    shareable: true,
    fields: (t) => ({
      property: t.string({
        nullable: false,
        resolve: (parent) => parent.property
      }),
      visitors: t.int({
        nullable: true,
        resolve: (parent) => parent.visitors
      }),
      visits: t.int({
        nullable: true,
        resolve: (parent) => parent.visits
      }),
      pageviews: t.int({
        nullable: true,
        resolve: (parent) => parent.pageviews
      }),
      viewsPerVisit: t.float({
        nullable: true,
        resolve: (parent) => parent.viewsPerVisit
      }),
      bounceRate: t.int({
        nullable: true,
        resolve: (parent) => parent.bounceRate
      }),
      visitDuration: t.int({
        nullable: true,
        resolve: (parent) => parent.visitDuration
      }),
      events: t.int({
        nullable: true,
        resolve: (parent) => parent.events
      }),
      conversionRate: t.int({
        nullable: true,
        resolve: (parent) => parent.conversionRate
      }),
      timeOnPage: t.float({
        nullable: true,
        resolve: (parent) => parent.timeOnPage
      })
    })
  })

// Define input types
const PlausibleStatsAggregateFilter = builder.inputType(
  'PlausibleStatsAggregateFilter',
  {
    fields: (t) => ({
      period: t.string({ required: false }),
      date: t.string({ required: false }),
      filters: t.string({ required: false }),
      interval: t.string({ required: false })
    })
  }
)

const PlausibleStatsBreakdownFilter = builder.inputType(
  'PlausibleStatsBreakdownFilter',
  {
    fields: (t) => ({
      property: t.string({ required: true }),
      period: t.string({ required: false }),
      date: t.string({ required: false }),
      limit: t.int({ required: false }),
      page: t.int({ required: false }),
      filters: t.string({ required: false })
    })
  }
)

const PlausibleStatsTimeseriesFilter = builder.inputType(
  'PlausibleStatsTimeseriesFilter',
  {
    fields: (t) => ({
      period: t.string({ required: false }),
      date: t.string({ required: false }),
      filters: t.string({ required: false }),
      interval: t.string({ required: false })
    })
  }
)

// Helper functions to extract metrics from GraphQL info
function getFieldNames(selections: ReadonlyArray<SelectionNode>): string[] {
  const fieldNames: string[] = []

  for (const selection of selections) {
    if (selection.kind === Kind.FIELD && selection.name.value) {
      fieldNames.push(selection.name.value)
    } else if (
      selection.kind === Kind.INLINE_FRAGMENT &&
      selection.selectionSet
    ) {
      fieldNames.push(...getFieldNames(selection.selectionSet.selections))
    } else if (selection.kind === Kind.FRAGMENT_SPREAD) {
      // For fragment spreads, fall back to requesting common metrics
      fieldNames.push('visitors', 'visits', 'pageviews', 'events')
    }
  }

  return fieldNames
}

function getMetrics(info: GraphQLResolveInfo): string {
  const fieldNames = getFieldNames(
    info.fieldNodes[0]?.selectionSet?.selections ?? []
  )
  const metrics = pull(fieldNames, '__typename', 'property')
  return metrics.map(snakeCase).join(',') || 'visitors'
}

// Helper function to load journey with permissions
async function loadJourney(id: string, idType: 'databaseId' | 'slug' | null) {
  const actualIdType: 'databaseId' | 'slug' = idType ?? 'slug'
  const whereClause = actualIdType === 'slug' ? { slug: id } : { id }

  const journey = await prisma.journey.findUnique({
    where: whereClause,
    include: {
      team: { include: { userTeams: true } },
      userJourneys: true
    }
  })

  if (!journey) {
    throw new GraphQLError('journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  return journey
}

// Mock Plausible service functions (in a real implementation, these would call the actual Plausible API)
async function getStatsAggregate(
  journeyId: string,
  metrics: string,
  params: any
): Promise<PlausibleStatsAggregateResponse> {
  // Mock implementation - replace with actual Plausible API calls
  const mockValue: PlausibleStatsAggregateValue = { value: 0, change: 0 }
  return {
    visitors: mockValue,
    visits: mockValue,
    pageviews: mockValue,
    viewsPerVisit: mockValue,
    bounceRate: mockValue,
    visitDuration: mockValue,
    events: mockValue,
    conversionRate: mockValue,
    timeOnPage: mockValue
  }
}

async function getStatsBreakdown(
  journeyId: string,
  metrics: string,
  params: any
): Promise<PlausibleStatsResponse[]> {
  // Mock implementation - replace with actual Plausible API calls
  return []
}

async function getStatsTimeseries(
  journeyId: string,
  metrics: string,
  params: any
): Promise<PlausibleStatsResponse[]> {
  // Mock implementation - replace with actual Plausible API calls
  return []
}

// Queries
builder.queryField('journeysPlausibleStatsRealtimeVisitors', (t) =>
  t.withAuth({ isAuthenticated: true }).int({
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({ type: IdType, required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, idType = 'slug' } = args
      const journey = await loadJourney(id, idType)

      // Mock implementation - replace with actual Plausible API call
      return 0
    }
  })
)

builder.queryField('journeysPlausibleStatsAggregate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: PlausibleStatsAggregateResponseRef,
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({ type: IdType, required: false }),
      where: t.arg({ type: PlausibleStatsAggregateFilter, required: true })
    },
    resolve: async (_parent, args, context, info) => {
      const { id, idType = 'slug', where } = args
      const journey = await loadJourney(id, idType)

      const metrics = getMetrics(info)
      const result = await getStatsAggregate(journey.id, metrics, where)

      return result
    }
  })
)

builder.queryField('journeysPlausibleStatsBreakdown', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [PlausibleStatsResponseRef],
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({ type: IdType, required: false }),
      where: t.arg({ type: PlausibleStatsBreakdownFilter, required: true })
    },
    resolve: async (_parent, args, context, info) => {
      const { id, idType = 'slug', where } = args
      const journey = await loadJourney(id, idType)

      const metrics = getMetrics(info)
      const result = await getStatsBreakdown(journey.id, metrics, where)

      return result
    }
  })
)

builder.queryField('journeysPlausibleStatsTimeseries', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [PlausibleStatsResponseRef],
    args: {
      id: t.arg.id({ required: true }),
      idType: t.arg({ type: IdType, required: false }),
      where: t.arg({ type: PlausibleStatsTimeseriesFilter, required: true })
    },
    resolve: async (_parent, args, context, info) => {
      const { id, idType = 'slug', where } = args
      const journey = await loadJourney(id, idType)

      const metrics = getMetrics(info)
      const result = await getStatsTimeseries(journey.id, metrics, where)

      return result
    }
  })
)
