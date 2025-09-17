import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { MessagePlatform, VideoBlockSource } from '../../enums'
import { Action } from '../../journey/journey.acl'
import { Language } from '../../language/language'
import { ButtonActionEnum } from '../button/enums'
import { EventInterface } from '../event'

import { JourneyEventsFilter } from './inputs'
import { canAccessJourneyEvents } from './journeyEvent.acl'

export const JourneyEventRef = builder.prismaNode('Event', {
  variant: 'JourneyEvent',
  interfaces: [EventInterface],
  id: { field: 'id' },
  shareable: true,
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
      select: {
        languageId: true
      },
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
      select: {
        journey: {
          select: {
            slug: true
          }
        }
      },
      resolve: async (event) => {
        return event.journey?.slug ?? null
      }
    }),
    visitorName: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            name: true
          }
        }
      },
      resolve: async (event: any) => {
        return event.visitor?.name ?? null
      }
    }),
    visitorEmail: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            email: true
          }
        }
      },
      resolve: async (event: any) => {
        return event.visitor?.email ?? null
      }
    }),
    visitorPhone: t.field({
      type: 'String',
      nullable: true,
      select: {
        visitor: {
          select: {
            phone: true
          }
        }
      },
      resolve: async (event: any) => {
        return event.visitor?.phone ?? null
      }
    })
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
  t.withAuth({ isAuthenticated: true }).prismaConnection({
    override: {
      from: 'api-journeys'
    },
    type: JourneyEventRef,
    nullable: false,
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
    override: {
      from: 'api-journeys'
    },
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
