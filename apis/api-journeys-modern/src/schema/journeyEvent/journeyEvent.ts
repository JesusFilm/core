import { GraphQLError } from 'graphql'
import isNil from 'lodash/isNil'
import omit from 'lodash/omit'
import omitBy from 'lodash/omitBy'

import { Prisma } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { EventInterface } from '../event/event' // Import the Event interface

import { canAccessJourneyEvents } from './journeyEvent.acl'

// Define JourneyEventsFilter input type - matches legacy API
const JourneyEventsFilter = builder.inputType('JourneyEventsFilter', {
  fields: (t) => ({
    typenames: t.stringList({ required: false }),
    periodRangeStart: t.field({ type: 'DateTime', required: false }),
    periodRangeEnd: t.field({ type: 'DateTime', required: false })
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
        gte: filter?.periodRangeStart,
        lte: filter?.periodRangeEnd
      },
      typename: filter?.typenames ? { in: filter.typenames } : undefined
    },
    isNil
  )
}

// Service function to get journey events with pagination
async function getJourneyEvents({
  journeyId,
  first,
  after,
  filter
}: {
  journeyId: string
  first: number
  after?: string | null
  filter?: {
    typenames?: string[] | null
    periodRangeStart?: Date | null
    periodRangeEnd?: Date | null
  }
}): Promise<{
  edges: Array<{
    node: {
      id: string
      journeyId: string | null
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
    }
    cursor: string
  }>
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string | null
    endCursor: string | null
  }
}> {
  const where = generateWhere(journeyId, filter)

  // Get one extra to check if there's a next page
  const result = await prisma.event.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: first + 1,
    skip: after ? 1 : 0,
    cursor: after ? { id: after } : undefined,
    include: {
      journey: true,
      visitor: true
    }
  })

  const hasNextPage = result.length > first
  const sendResult = hasNextPage ? result.slice(0, first) : result

  return {
    edges: sendResult.map((event) => ({
      node: {
        id: event.id,
        journeyId: event.journeyId,
        createdAt: event.createdAt,
        label: event.label,
        value: event.value,
        action: event.action as string | null,
        actionValue: event.actionValue,
        messagePlatform: event.messagePlatform as string | null,
        email: event.email,
        blockId: event.blockId,
        position: event.position,
        source: event.source as string | null,
        progress: event.progress,
        typename: event.typename,
        visitorId: event.visitorId,
        journeySlug: event.journey?.slug ?? null,
        visitorName: event.visitor?.name ?? null,
        visitorEmail: event.visitor?.email ?? null,
        visitorPhone: event.visitor?.phone ?? null
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

// journeyEventsConnection query - using prismaConnection with Event interface
builder.queryField('journeyEventsConnection', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaConnection({
    type: EventInterface, // Use the Event interface from event.ts
    cursor: 'id',
    args: {
      journeyId: t.arg.id({ required: true }),
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

      // Use prisma connection with proper filtering
      const where = generateWhere(journeyId, filter ?? undefined)
      return await prisma.event.findMany({
        ...query,
        where,
        orderBy: { createdAt: 'desc' }
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

      return await getJourneyEventsCount({
        journeyId,
        filter: filter ?? undefined
      })
    }
  })
)
