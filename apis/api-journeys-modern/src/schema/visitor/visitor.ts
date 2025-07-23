import { GraphQLError } from 'graphql'
import isNil from 'lodash/isNil'
import omitBy from 'lodash/omitBy'

import { Prisma } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'
import { MessagePlatform } from '../enums'

import { JourneyVisitorSort, VisitorStatus } from './enums'
import {
  JourneyVisitorFilter,
  VisitorUpdateForCurrentUserInput,
  VisitorUpdateInput
} from './inputs'
import { UserAgentRef } from './types'
// import { canAccessJourneyVisitors } from './visitor.acl'
import { VisitorService } from './visitor.service'

// Create service instance
const visitorService = new VisitorService()

// Define Visitor type using Prisma model
const VisitorRef = builder.prismaObject('Visitor', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    duration: t.exposeInt('duration'),
    lastChatStartedAt: t.expose('lastChatStartedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastChatPlatform: t.expose('lastChatPlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    userAgent: t.field({
      type: UserAgentRef,
      nullable: true,
      resolve: (visitor) => visitor.userAgent as any
    }),
    countryCode: t.exposeString('countryCode', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    status: t.expose('status', { type: VisitorStatus, nullable: true }),
    messagePlatform: t.expose('messagePlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    messagePlatformId: t.exposeString('messagePlatformId', { nullable: true }),
    notes: t.exposeString('notes', { nullable: true }),
    lastStepViewedAt: t.expose('lastStepViewedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastLinkAction: t.exposeString('lastLinkAction', { nullable: true }),
    lastTextResponse: t.exposeString('lastTextResponse', { nullable: true }),
    lastRadioQuestion: t.exposeString('lastRadioQuestion', { nullable: true }),
    lastRadioOptionSubmission: t.exposeString('lastRadioOptionSubmission', {
      nullable: true
    }),
    referrer: t.exposeString('referrer', { nullable: true }),
    phone: t.exposeString('phone', { nullable: true }),
    teamId: t.exposeString('teamId'),
    userId: t.exposeString('userId'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    // Relations
    team: t.relation('team'),
    journeyVisitors: t.relation('journeyVisitors'),
    events: t.relation('events')
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
    lastChatStartedAt: t.expose('lastChatStartedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastChatPlatform: t.expose('lastChatPlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    lastStepViewedAt: t.expose('lastStepViewedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastLinkAction: t.exposeString('lastLinkAction', { nullable: true }),
    lastTextResponse: t.exposeString('lastTextResponse', { nullable: true }),
    lastRadioQuestion: t.exposeString('lastRadioQuestion', { nullable: true }),
    lastRadioOptionSubmission: t.exposeString('lastRadioOptionSubmission', {
      nullable: true
    }),
    activityCount: t.exposeInt('activityCount'),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    // Additional fields from visitor relation for convenience
    countryCode: t.field({
      type: 'String',
      nullable: true,
      resolve: async (journeyVisitor) => {
        const visitor = await prisma.visitor.findUnique({
          where: { id: journeyVisitor.visitorId },
          select: { countryCode: true }
        })
        return visitor?.countryCode || null
      }
    }),
    messagePlatform: t.field({
      type: MessagePlatform,
      nullable: true,
      resolve: async (journeyVisitor) => {
        const visitor = await prisma.visitor.findUnique({
          where: { id: journeyVisitor.visitorId },
          select: { messagePlatform: true }
        })
        return visitor?.messagePlatform || null
      }
    }),
    notes: t.field({
      type: 'String',
      nullable: true,
      resolve: async (journeyVisitor) => {
        const visitor = await prisma.visitor.findUnique({
          where: { id: journeyVisitor.visitorId },
          select: { notes: true }
        })
        return visitor?.notes || null
      }
    }),
    // Relations
    journey: t.relation('journey'),
    visitor: t.relation('visitor'),
    events: t.relation('events')
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
    hasPollAnswers?: boolean | null
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

  if (filter?.hasPollAnswers === true) {
    where.lastRadioQuestion = { not: null }
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

// Add the missing visitor query
builder.queryField('visitor', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VisitorRef,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Get visitor with team relation for authorization
      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: {
          team: { include: { userTeams: true } },
          journeyVisitors: {
            include: { journey: { include: { userJourneys: true } } }
          }
        }
      })

      if (!visitor) {
        throw new GraphQLError('visitor not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization - user must be team member or journey owner
      const isTeamMember = visitor.team.userTeams.some(
        (ut) => ut.userId === user.id
      )
      const isJourneyOwner = visitor.journeyVisitors.some((jv) =>
        jv.journey.userJourneys.some((uj) => uj.userId === user.id)
      )

      if (!isTeamMember && !isJourneyOwner) {
        throw new GraphQLError('user is not allowed to view visitor', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return visitor
    }
  })
)

// Team-level visitor queries
builder.queryField('visitorsConnection', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaConnection({
    type: VisitorRef,
    cursor: 'id',
    args: {
      teamId: t.arg.id({ required: false })
    },
    resolve: async (query, _parent, args, context) => {
      const { teamId } = args
      const user = context.user

      // If teamId is provided, check access to that specific team
      if (teamId) {
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          include: { userTeams: true }
        })

        if (!team) {
          throw new GraphQLError('team not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        // Check authorization - user must be team member
        const isTeamMember = team.userTeams.some((ut) => ut.userId === user.id)
        if (!isTeamMember) {
          throw new GraphQLError('user is not allowed to read team visitors', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        // Query visitors for the specific team
        return await prisma.visitor.findMany({
          ...query,
          where: { teamId },
          orderBy: { createdAt: 'desc' }
        })
      }

      // If no teamId provided, return visitors from teams the user is a member of
      const userTeams = await prisma.userTeam.findMany({
        where: { userId: user.id },
        select: { teamId: true }
      })

      const teamIds = userTeams.map((ut) => ut.teamId)

      if (teamIds.length === 0) {
        // User is not a member of any team
        return await prisma.visitor.findMany({
          ...query,
          where: { teamId: { in: [] } }, // Return empty result
          orderBy: { createdAt: 'desc' }
        })
      }

      // Query visitors from all teams the user is a member of
      return await prisma.visitor.findMany({
        ...query,
        where: { teamId: { in: teamIds } },
        orderBy: { createdAt: 'desc' }
      })
    }
  })
)

// Visitor Mutations
builder.mutationField('visitorUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VisitorRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({
        type: VisitorUpdateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Get visitor with team relation
      const visitor = await prisma.visitor.findUnique({
        where: { id },
        include: { team: { include: { userTeams: true } } }
      })

      if (!visitor) {
        throw new GraphQLError('visitor not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization - user must be team member
      const isTeamMember = visitor.team.userTeams.some(
        (ut) => ut.userId === user.id
      )
      if (!isTeamMember) {
        throw new GraphQLError('user is not allowed to update visitor', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Update visitor
      return await prisma.visitor.update({
        where: { id },
        data: omitBy(input, isNil)
      })
    }
  })
)

builder.mutationField('visitorUpdateForCurrentUser', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: VisitorRef,
    args: {
      input: t.arg({
        type: VisitorUpdateInput, // Changed from VisitorUpdateForCurrentUserInput
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const user = context.user

      // Find visitor for current user
      const visitor = await prisma.visitor.findFirst({
        where: { userId: user.id },
        include: { team: { include: { userTeams: true } } }
      })

      if (!visitor) {
        throw new GraphQLError('visitor not found for current user', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Update visitor with limited fields for current user (matching legacy API behavior)
      // Only allow countryCode and referrer fields for current user updates
      const allowedFields = ['countryCode', 'referrer']
      const filteredInput = Object.fromEntries(
        Object.entries(input).filter(([key]) => allowedFields.includes(key))
      )

      return await prisma.visitor.update({
        where: { id: visitor.id },
        data: omitBy(filteredInput, isNil)
      })
    }
  })
)
