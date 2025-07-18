import { GraphQLError } from 'graphql'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import { Prisma } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// import { canAccessJourneyVisitors } from './visitor.acl'
import { VisitorService } from './visitor.service'

// Create service instance
const visitorService = new VisitorService()

// Simple enum definitions
const JourneyVisitorSort = builder.enumType('JourneyVisitorSort', {
  values: ['date', 'duration', 'activity'] as const
})

// Define Visitor type using Prisma model
const VisitorRef = builder.prismaObject('Visitor', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    countryCode: t.exposeString('countryCode', { nullable: true }),
    duration: t.exposeInt('duration'),
    email: t.exposeString('email', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    phone: t.exposeString('phone', { nullable: true }),
    teamId: t.exposeString('teamId'),
    userId: t.exposeString('userId'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    // Relations
    team: t.relation('team'),
    journeyVisitors: t.relation('journeyVisitors')
  })
})

// Define input filters
const JourneyVisitorFilter = builder.inputType('JourneyVisitorFilter', {
  fields: (t) => ({
    countryCode: t.string({ required: false }),
    hasIcon: t.boolean({ required: false }),
    hasChatStarted: t.boolean({ required: false }),
    hasTextResponse: t.boolean({ required: false }),
    hideInactive: t.boolean({ required: false }),
    journeyId: t.id({ required: true })
  })
})

// Define JourneyVisitor type using Prisma model
const JourneyVisitorRef = builder.prismaObject('JourneyVisitor', {
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeString('journeyId'),
    visitorId: t.exposeString('visitorId'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    duration: t.exposeInt('duration'),
    activityCount: t.exposeInt('activityCount'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    // Relations
    journey: t.relation('journey'),
    visitor: t.relation('visitor')
  })
})

// Helper function to generate WHERE clause for filtering
function generateVisitorWhere(
  journeyId: string,
  filter?: {
    countryCode?: string | null
    hasIcon?: boolean | null
    hasChatStarted?: boolean | null
    hasTextResponse?: boolean | null
    hideInactive?: boolean | null
  }
): Prisma.JourneyVisitorWhereInput {
  const where: Prisma.JourneyVisitorWhereInput = {
    journeyId
  }

  if (filter?.countryCode) {
    where.visitor = { countryCode: filter.countryCode }
  }

  if (filter?.hasIcon === true) {
    where.visitor = {
      ...where.visitor,
      status: { not: null } as any
    }
  }

  if (filter?.hasChatStarted === true) {
    where.lastChatStartedAt = { not: null }
  }

  if (filter?.hasTextResponse === true) {
    where.lastTextResponse = { not: null }
  }

  if (filter?.hideInactive === true) {
    where.activityCount = { gt: 0 }
  }

  return where
}

// Query Operations using Relay connections
builder.queryField('journeyVisitorsConnection', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaConnection({
    type: JourneyVisitorRef,
    cursor: 'id',
    args: {
      filter: t.arg({ type: JourneyVisitorFilter, required: true }),
      sort: t.arg({ type: JourneyVisitorSort, required: false })
    },
    resolve: async (query, _parent, args, context) => {
      const { filter, sort } = args
      const user = context.user
      const { journeyId } = filter

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

      // Check authorization - simplified for now
      const isTeamMember = journey.team?.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const isJourneyOwner = journey.userJourneys.some(
        (uj) => uj.userId === user.id
      )

      if (!isTeamMember && !isJourneyOwner) {
        throw new GraphQLError('user is not allowed to read journey visitors', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Build where clause and order by
      const where = generateVisitorWhere(journeyId, filter)
      const orderBy: Prisma.JourneyVisitorOrderByWithRelationInput =
        sort === 'duration'
          ? { duration: 'desc' }
          : sort === 'activity'
            ? { activityCount: 'desc' }
            : { createdAt: 'desc' } // default: date

      return await prisma.journeyVisitor.findMany({
        ...query,
        where,
        orderBy
      })
    }
  })
)

builder.queryField('journeyVisitorCount', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: 'Int',
    args: {
      filter: t.arg({ type: JourneyVisitorFilter, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { filter } = args
      const user = context.user
      const { journeyId } = filter

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

      // Check authorization - simplified for now
      const isTeamMember = journey.team?.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const isJourneyOwner = journey.userJourneys.some(
        (uj) => uj.userId === user.id
      )

      if (!isTeamMember && !isJourneyOwner) {
        throw new GraphQLError('user is not allowed to read journey visitors', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Build where clause and count
      const where = generateVisitorWhere(journeyId, filter)
      return await prisma.journeyVisitor.count({ where })
    }
  })
)
