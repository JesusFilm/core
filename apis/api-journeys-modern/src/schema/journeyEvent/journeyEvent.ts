import { GraphQLError } from 'graphql'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'

import { Prisma } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { canAccessJourneyEvents } from './journeyEvent.acl'

// Define JourneyEventsFilter input type - matches legacy API
const JourneyEventsFilter = builder.inputType('JourneyEventsFilter', {
  fields: (t) => ({
    typenames: t.stringList({ required: false }),
    periodRangeStart: t.field({ type: 'DateTime', required: false }),
    periodRangeEnd: t.field({ type: 'DateTime', required: false })
  })
})

// Define types with object refs to avoid conflicts
const PageInfoRef = builder.objectRef<{
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
}>('PageInfo')

const JourneyEventRef = builder.objectRef<{
  id: string
  journeyId: string
  createdAt: Date
  label: string | null
  value: string | null
  action: string | null
  actionValue: string | null
  messagePlatform: string | null
  email: string | null
  blockId: string | null
  position: number | null
  source: string | null
  progress: number | null
  typename: string | null
  visitorId: string | null
  journeySlug: string | null
  visitorName: string | null
  visitorEmail: string | null
  visitorPhone: string | null
}>('JourneyEvent')

const JourneyEventEdgeRef = builder.objectRef<{
  cursor: string
  node: any
}>('JourneyEventEdge')

const JourneyEventsConnectionRef = builder.objectRef<{
  edges: any[]
  pageInfo: any
}>('JourneyEventsConnection')

// Define PageInfo type for pagination - this might already exist but we'll define it again
builder.objectType(PageInfoRef, {
  fields: (t) => ({
    hasNextPage: t.exposeBoolean('hasNextPage'),
    hasPreviousPage: t.exposeBoolean('hasPreviousPage'),
    startCursor: t.exposeString('startCursor', { nullable: true }),
    endCursor: t.exposeString('endCursor', { nullable: true })
  })
})

// Define JourneyEvent type - matches legacy API fields
builder.objectType(JourneyEventRef, {
  fields: (t) => ({
    // Base event fields from Event interface
    id: t.exposeID('id'),
    journeyId: t.exposeID('journeyId'),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (event) => event.createdAt
    }),
    label: t.exposeString('label', { nullable: true }),
    value: t.exposeString('value', { nullable: true }),

    // Additional specific event fields
    action: t.exposeString('action', { nullable: true }),
    actionValue: t.exposeString('actionValue', { nullable: true }),
    messagePlatform: t.exposeString('messagePlatform', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    blockId: t.exposeString('blockId', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.exposeString('source', { nullable: true }),
    progress: t.exposeInt('progress', { nullable: true }),

    // Database fields
    typename: t.exposeString('typename', { nullable: true }),
    visitorId: t.exposeString('visitorId', { nullable: true }),

    // Related fields queried from relevant ids in the events table
    journeySlug: t.exposeString('journeySlug', { nullable: true }),
    visitorName: t.exposeString('visitorName', { nullable: true }),
    visitorEmail: t.exposeString('visitorEmail', { nullable: true }),
    visitorPhone: t.exposeString('visitorPhone', { nullable: true })
  })
})

// Define JourneyEventEdge type
builder.objectType(JourneyEventEdgeRef, {
  fields: (t) => ({
    cursor: t.exposeString('cursor'),
    node: t.field({
      type: JourneyEventRef,
      resolve: (edge) => edge.node
    })
  })
})

// Define JourneyEventsConnection type
builder.objectType(JourneyEventsConnectionRef, {
  fields: (t) => ({
    edges: t.field({
      type: [JourneyEventEdgeRef],
      resolve: (connection) => connection.edges
    }),
    pageInfo: t.field({
      type: PageInfoRef,
      resolve: (connection) => connection.pageInfo
    })
  })
})

// Helper function to generate WHERE clause for filtering - matches legacy API
function generateWhere(
  journeyId: string,
  filter?: {
    typenames?: string[] | null
    periodRangeStart?: Date | null
    periodRangeEnd?: Date | null
  }
): Prisma.EventWhereInput {
  return omitBy(
    {
      journeyId,
      createdAt: {
        gte: filter?.periodRangeStart ?? undefined,
        lte: filter?.periodRangeEnd ?? undefined
      },
      typename: filter?.typenames ? { in: filter.typenames } : undefined
    },
    isNil
  )
}

// Service function to get journey events - matches legacy API logic
async function getJourneyEvents({
  journeyId,
  filter,
  first,
  after
}: {
  journeyId: string
  filter?: {
    typenames?: string[] | null
    periodRangeStart?: Date | null
    periodRangeEnd?: Date | null
  }
  first: number
  after?: string | null
}) {
  const where = generateWhere(journeyId, filter)

  const result = await prisma.event.findMany({
    where,
    select: {
      id: true,
      journeyId: true,
      createdAt: true,
      label: true,
      value: true,
      typename: true,
      visitorId: true,
      action: true,
      actionValue: true,
      messagePlatform: true,
      email: true,
      blockId: true,
      position: true,
      source: true,
      progress: true,
      journey: {
        select: {
          id: true,
          slug: true
        }
      },
      visitor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    cursor: after != null ? { id: after } : undefined,
    skip: after == null ? 0 : 1,
    take: first + 1
  })

  const sendResult = result.length > first ? result.slice(0, -1) : result
  return {
    edges: sendResult.map((event) => ({
      node: {
        ...omit(event, ['journey', 'visitor']),
        journeyId: event.journey?.id ?? journeyId,
        visitorId: event.visitor?.id ?? null,
        createdAt: event.createdAt,
        action: event.action as string | null,
        messagePlatform: event.messagePlatform as string | null,
        source: event.source as string | null,
        journeySlug: event.journey?.slug,
        visitorName: event.visitor?.name,
        visitorEmail: event.visitor?.email,
        visitorPhone: event.visitor?.phone
      },
      cursor: event.id
    })),
    pageInfo: {
      hasNextPage: result.length > first,
      hasPreviousPage: false, // Mocked to match legacy API
      startCursor: result.length > 0 ? result[0].id : null,
      endCursor: result.length > 0 ? sendResult[sendResult.length - 1].id : null
    }
  }
}

// Service function to get journey events count - matches legacy API logic
async function getJourneyEventsCount({
  journeyId,
  filter
}: {
  journeyId: string
  filter?: {
    typenames?: string[] | null
    periodRangeStart?: Date | null
    periodRangeEnd?: Date | null
  }
}): Promise<number> {
  const where = generateWhere(journeyId, filter)
  return await prisma.event.count({ where })
}

// journeyEventsConnection query - matches legacy API
builder.queryField('journeyEventsConnection', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyEventsConnectionRef,
    nullable: false,
    args: {
      journeyId: t.arg.id({ required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false }),
      first: t.arg.int({ required: false }),
      after: t.arg.string({ required: false })
    },
    resolve: async (_parent, args, context) => {
      const { journeyId, filter, first = 50, after } = args
      const user = context.user

      // Check if journey exists and get authorization info
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!canAccessJourneyEvents(Action.Read, journey, user)) {
        throw new GraphQLError('user is not allowed to read journey events', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Get and return journey events
      return await getJourneyEvents({
        journeyId,
        filter: filter ?? undefined,
        first: first ?? 50,
        after
      })
    }
  })
)

// journeyEventsCount query - matches legacy API
builder.queryField('journeyEventsCount', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      journeyId: t.arg.id({ required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false })
    },
    resolve: async (_parent, args, context) => {
      const { journeyId, filter } = args
      const user = context.user

      // Check if journey exists and get authorization info
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!canAccessJourneyEvents(Action.Read, journey, user)) {
        throw new GraphQLError('user is not allowed to read journey events', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Get and return journey events count
      return await getJourneyEventsCount({
        journeyId,
        filter: filter ?? undefined
      })
    }
  })
)
