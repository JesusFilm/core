import { GraphQLError } from 'graphql'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'

import { ButtonAction, Prisma } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { MessagePlatform, VideoBlockSource } from '../enums'
import { EventInterface } from '../event/event'
import { Language } from '../language/language'

import { canAccessJourneyEvents } from './journeyEvent.acl'

// Define the JourneyEvent type that implements Event interface using prismaObject
const JourneyEventRef = builder.prismaObject('Event', {
  variant: 'JourneyEvent',
  interfaces: [EventInterface],
  fields: (t) => ({
    action: t.expose('action', { type: ButtonAction, nullable: true }),
    actionValue: t.exposeString('actionValue', { nullable: true }),
    messagePlatform: t.expose('messagePlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    language: t.field({
      type: Language,
      nullable: true,
      resolve: async (event) => {
        if (!event.languageId) return null
        // Return a reference to the federated Language entity
        return { id: event.languageId }
      }
    }),
    email: t.exposeString('email', { nullable: true }),
    blockId: t.exposeString('blockId', { nullable: true }),
    position: t.exposeFloat('position', { nullable: true }),
    source: t.expose('source', { type: VideoBlockSource, nullable: true }),
    progress: t.exposeInt('progress', { nullable: true }),

    // Database fields from the events table
    typename: t.exposeString('typename', { nullable: true }),
    visitorId: t.exposeString('visitorId', { nullable: true }),

    // Related fields queried from relevant ids in the events table
    journeySlug: t.field({
      type: 'String',
      nullable: true,
      resolve: async (event) => {
        if (!event.journeyId) return null
        const journey = await prisma.journey.findUnique({
          where: { id: event.journeyId },
          select: { slug: true }
        })
        return journey?.slug ?? null
      }
    }),
    visitorName: t.field({
      type: 'String',
      nullable: true,
      resolve: async (event) => {
        if (!event.visitorId) return null
        const visitor = await prisma.visitor.findUnique({
          where: { id: event.visitorId },
          select: { name: true }
        })
        return visitor?.name ?? null
      }
    }),
    visitorEmail: t.field({
      type: 'String',
      nullable: true,
      resolve: async (event) => {
        if (!event.visitorId) return null
        const visitor = await prisma.visitor.findUnique({
          where: { id: event.visitorId },
          select: { email: true }
        })
        return visitor?.email ?? null
      }
    }),
    visitorPhone: t.field({
      type: 'String',
      nullable: true,
      resolve: async (event) => {
        if (!event.visitorId) return null
        const visitor = await prisma.visitor.findUnique({
          where: { id: event.visitorId },
          select: { phone: true }
        })
        return visitor?.phone ?? null
      }
    })
  })
})

// Define input types for filtering
const JourneyEventsFilter = builder.inputType('JourneyEventsFilter', {
  fields: (t) => ({
    typenames: t.stringList({ required: false }),
    periodRangeStart: t.field({ type: 'DateTime', required: false }),
    periodRangeEnd: t.field({ type: 'DateTime', required: false })
  })
})

// JourneyEvent Edge for connection
interface JourneyEventEdgeType {
  cursor: string
  node: any
}

interface JourneyEventsConnectionType {
  edges: JourneyEventEdgeType[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string | null
    endCursor: string | null
  }
}

const JourneyEventEdge =
  builder.objectRef<JourneyEventEdgeType>('JourneyEventEdge')

JourneyEventEdge.implement({
  fields: (t) => ({
    cursor: t.exposeString('cursor'),
    node: t.expose('node', { type: JourneyEventRef })
  })
})

// JourneyEvents Connection
const JourneyEventsConnection = builder.objectRef<JourneyEventsConnectionType>(
  'JourneyEventsConnection'
)

JourneyEventsConnection.implement({
  fields: (t) => ({
    edges: t.expose('edges', { type: [JourneyEventEdge] }),
    pageInfo: t.expose('pageInfo', { type: 'Json' }) // Simplified for now
  })
})

// Helper function to generate where clause
function generateWhere(
  journeyId: string,
  filter:
    | {
        typenames?: string[] | null
        periodRangeStart?: Date | null
        periodRangeEnd?: Date | null
      }
    | null
    | undefined,
  accessibleEvent: Prisma.EventWhereInput
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    AND: [accessibleEvent, { journeyId }]
  }

  if (filter?.typenames) {
    where.typename = { in: filter.typenames }
  }

  if (filter?.periodRangeStart || filter?.periodRangeEnd) {
    where.createdAt = {}
    if (filter.periodRangeStart) {
      where.createdAt.gte = filter.periodRangeStart
    }
    if (filter.periodRangeEnd) {
      where.createdAt.lte = filter.periodRangeEnd
    }
  }

  return where
}

// Query: journeyEventsConnection
builder.queryField('journeyEventsConnection', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyEventsConnection,
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false }),
      first: t.arg({ type: 'Int', required: false }),
      after: t.arg({ type: 'String', required: false })
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

      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check access using ACL
      const canAccess = canAccessJourneyEvents(Action.Read, journey, user)
      if (!canAccess) {
        throw new GraphQLError('user is not allowed to access journey events', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const accessibleEvent: Prisma.EventWhereInput = {} // ACL would set this
      const where = generateWhere(journeyId, filter, accessibleEvent)

      const events = await prisma.event.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: (first ?? 50) + 1, // Get one extra to check if there's more
        skip: after ? 1 : 0,
        cursor: after ? { id: after } : undefined
      })

      const hasNextPage = events.length > (first ?? 50)
      const nodes = hasNextPage ? events.slice(0, first ?? 50) : events

      return {
        edges: nodes.map((event) => ({
          cursor: event.id,
          node: event
        })),
        pageInfo: {
          hasNextPage,
          hasPreviousPage: false, // Simple implementation
          startCursor: nodes.length > 0 ? nodes[0].id : null,
          endCursor: nodes.length > 0 ? nodes[nodes.length - 1].id : null
        }
      }
    }
  })
)

// Query: journeyEventsCount
builder.queryField('journeyEventsCount', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Int',
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
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

      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check access using ACL
      const canAccess = canAccessJourneyEvents(Action.Read, journey, user)
      if (!canAccess) {
        throw new GraphQLError('user is not allowed to access journey events', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const accessibleEvent: Prisma.EventWhereInput = {} // ACL would set this
      const where = generateWhere(journeyId, filter, accessibleEvent)

      return await prisma.event.count({ where })
    }
  })
)

export { JourneyEventRef }
