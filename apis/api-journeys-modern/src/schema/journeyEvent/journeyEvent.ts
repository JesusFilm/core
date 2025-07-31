import { GraphQLError } from 'graphql'

import { Prisma } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { MessagePlatform, VideoBlockSource } from '../enums'
import { ButtonActionEnum } from '../event/button'
import { EventInterface } from '../event/event'
import { Language } from '../language/language'

import { JourneyEventsFilter } from './inputs'
import { canAccessJourneyEvents } from './journeyEvent.acl'

// Define the JourneyEvent type that implements Event interface using prismaObject
const JourneyEventRef = builder.prismaNode('Event', {
  variant: 'JourneyEvent',
  interfaces: [EventInterface],
  id: { field: 'id' },
  nullable: true,
  fields: (t) => ({
    action: t.expose('action', { type: ButtonActionEnum, nullable: true }),
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

// JourneyEvent Edge for connection
// interface JourneyEventEdgeType {
//   cursor: string
//   node: any
// }

// interface JourneyEventsConnectionType {
//   edges: JourneyEventEdgeType[]
//   pageInfo: {
//     hasNextPage: boolean
//     hasPreviousPage: boolean
//     startCursor: string | null
//     endCursor: string | null
//   }
// }

// const JourneyEventEdge =
//   builder.objectRef<JourneyEventEdgeType>('JourneyEventEdge')

// JourneyEventEdge.implement({
//   fields: (t) => ({
//     cursor: t.exposeString('cursor'),
//     node: t.expose('node', { type: JourneyEventRef })
//   })
// })

// const JourneyEventsConnection = builder.prismaNode('JourneyEvent', {
//   id: { field: 'id' },
//   fields: (t) => ({
//     cursor:
// })

// JourneyEvents Connection
// const JourneyEventsConnection = builder.objectRef<JourneyEventsConnectionType>(
//   'JourneyEventsConnection'
// )

// JourneyEventsConnection.implement({
//   fields: (t) => ({
//     edges: t.expose('edges', { type: [JourneyEventEdge] }),
//     pageInfo: t.expose('pageInfo', { type: 'Json' }) // Simplified for now
//   })
// })

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
  t.withAuth({ isAuthenticated: true }).prismaConnection({
    type: JourneyEventRef,
    cursor: 'id',
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false })
    },
    resolve: async (query, _parent, args, context) => {
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

      return await prisma.event.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' }
      })
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
