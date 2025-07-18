import { GraphQLError } from 'graphql'
import pick from 'lodash/pick'
import { UAParser } from 'ua-parser-js'

import {
  DeviceType,
  MessagePlatform,
  VisitorStatus
} from '.prisma/api-journeys-modern-client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'



// Enums
builder.enumType(DeviceType, {
  name: 'DeviceType'
})

builder.enumType(MessagePlatform, {
  name: 'MessagePlatform'
})

builder.enumType(VisitorStatus, {
  name: 'VisitorStatus'
})

// Complex types for UserAgent
const BrowserType = builder.objectType('Browser', {
  fields: (t) => ({
    name: t.string({ nullable: true }),
    version: t.string({ nullable: true })
  })
})

const DeviceObjectType = builder.objectType('Device', {
  fields: (t) => ({
    model: t.string({ nullable: true }),
    type: t.field({
      type: DeviceType,
      nullable: true
    }),
    vendor: t.string({ nullable: true })
  })
})

const OperatingSystemType = builder.objectType('OperatingSystem', {
  fields: (t) => ({
    name: t.string({ nullable: true }),
    version: t.string({ nullable: true })
  })
})

const UserAgentType = builder.objectType('UserAgent', {
  fields: (t) => ({
    browser: t.field({
      type: BrowserType,
      resolve: (userAgent) => userAgent.browser || {}
    }),
    device: t.field({
      type: DeviceObjectType,
      resolve: (userAgent) => userAgent.device || {}
    }),
    os: t.field({
      type: OperatingSystemType,
      resolve: (userAgent) => userAgent.os || {}
    })
  })
})

// Visitor Object Type
builder.prismaObject('Visitor', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    duration: t.exposeInt('duration', { nullable: true }),
    lastChatStartedAt: t.expose('lastChatStartedAt', {
      type: 'DateTime',
      nullable: true
    }),
    lastChatPlatform: t.expose('lastChatPlatform', {
      type: MessagePlatform,
      nullable: true
    }),
    userAgent: t.field({
      type: UserAgentType,
      nullable: true,
      resolve: (visitor) => {
        if (
          visitor.userAgent != null &&
          typeof visitor.userAgent === 'string'
        ) {
          return new UAParser(visitor.userAgent).getResult()
        }
        return null
      }
    }),
    countryCode: t.exposeString('countryCode', { nullable: true }),
    name: t.exposeString('name', { nullable: true }),
    email: t.exposeString('email', { nullable: true }),
    status: t.expose('status', {
      type: VisitorStatus,
      nullable: true
    }),
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
    events: t.relation('events'),
    phone: t.exposeString('phone', { nullable: true })
  })
})

// JourneyVisitor Object Type
builder.prismaObject('JourneyVisitor', {
  fields: (t) => ({
    id: t.exposeID('id'),
    visitorId: t.exposeID('visitorId'),
    journeyId: t.exposeID('journeyId'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    duration: t.exposeInt('duration', { nullable: true }),
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
    visitor: t.relation('visitor'),
    events: t.relation('events')
  })
})

// Enums for JourneyVisitor
builder.enumType(JourneyVisitorSort, {
  name: 'JourneyVisitorSort'
})

// Input types
const VisitorUpdateInput = builder.inputType('VisitorUpdateInput', {
  fields: (t) => ({
    email: t.string({ required: false }),
    messagePlatformId: t.string({ required: false }),
    messagePlatform: t.field({
      type: MessagePlatform,
      required: false
    }),
    name: t.string({ required: false }),
    notes: t.string({ required: false }),
    status: t.field({
      type: VisitorStatus,
      required: false
    }),
    countryCode: t.string({ required: false }),
    referrer: t.string({ required: false }),
    phone: t.string({ required: false })
  })
})

const JourneyVisitorFilter = builder.inputType('JourneyVisitorFilter', {
  fields: (t) => ({
    journeyId: t.string({ required: true }),
    hasChatStarted: t.boolean({ required: false }),
    hasPollAnswers: t.boolean({ required: false }),
    hasTextResponse: t.boolean({ required: false }),
    hasIcon: t.boolean({ required: false }),
    hideInactive: t.boolean({ required: false }),
    countryCode: t.string({ required: false })
  })
})

// Connection types
const JourneyVisitorEdge = builder.objectType('JourneyVisitorEdge', {
  fields: (t) => ({
    cursor: t.exposeString('cursor'),
    node: t.field({
      type: 'JourneyVisitor',
      resolve: (edge) => edge.node
    })
  })
})

const PageInfo = builder.objectType('PageInfo', {
  fields: (t) => ({
    hasNextPage: t.exposeBoolean('hasNextPage'),
    hasPreviousPage: t.exposeBoolean('hasPreviousPage'),
    startCursor: t.exposeString('startCursor', { nullable: true }),
    endCursor: t.exposeString('endCursor', { nullable: true })
  })
})

const JourneyVisitorsConnection = builder.objectType(
  'JourneyVisitorsConnection',
  {
    fields: (t) => ({
      edges: t.field({
        type: [JourneyVisitorEdge],
        resolve: (connection) => connection.edges
      }),
      pageInfo: t.field({
        type: PageInfo,
        resolve: (connection) => connection.pageInfo
      })
    })
  }
)

// Visitor Queries
builder.queryFields((t) => ({
  visitor: t.prismaField({
    type: 'Visitor',
    args: {
      id: t.arg.id({ required: true })
    },
    authScopes: { authenticated: true },
    resolve: async (query, _parent, args, context) => {
      const visitor = await prisma.visitor.findUnique({
        ...query,
        where: { id: args.id },
        include: {
          team: {
            include: { userTeams: true }
          },
          journeyVisitors: {
            include: { journey: { include: { userJourneys: true } } }
          }
        }
      })

      if (!visitor) {
        throw new GraphQLError(`visitor with id "${args.id}" not found`, {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization using ACL
      if (
        !ability(Action.Read, abilitySubject('Visitor', visitor), context.user)
      ) {
        throw new GraphQLError('user is not allowed to view visitor', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return visitor
    }
  })
}))

// Visitor Mutations
builder.mutationFields((t) => ({
  visitorUpdate: t.prismaField({
    type: 'Visitor',
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({
        type: VisitorUpdateInput,
        required: true
      })
    },
    authScopes: { authenticated: true },
    resolve: async (query, _parent, args, context) => {
      const visitor = await prisma.visitor.findUnique({
        where: { id: args.id },
        include: {
          team: {
            include: { userTeams: true }
          },
          journeyVisitors: {
            include: { journey: { include: { userJourneys: true } } }
          }
        }
      })

      if (!visitor) {
        throw new GraphQLError(`visitor with id "${args.id}" not found`, {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Visitor', visitor),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update visitor', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.visitor.update({
        ...query,
        where: { id: visitor.id },
        data: args.input
      })
    }
  }),

  visitorUpdateForCurrentUser: t.prismaField({
    type: 'Visitor',
    args: {
      input: t.arg({
        type: VisitorUpdateInput,
        required: true
      })
    },
    authScopes: { authenticated: true },
    resolve: async (query, _parent, args, context) => {
      const visitor = await prisma.visitor.findFirst({
        where: { userId: context.user.id }
      })

      if (!visitor) {
        throw new GraphQLError(
          `visitor with userId "${context.user.id}" not found`,
          {
            extensions: { code: 'NOT_FOUND' }
          }
        )
      }

      // Check authorization using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Visitor', visitor),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update visitor', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Only allow updating certain fields for current user
      const allowedFields = pick(args.input, ['countryCode', 'referrer'])

      return await prisma.visitor.update({
        ...query,
        where: { id: visitor.id },
        data: allowedFields
      })
    }
  })
})

// JourneyVisitor Query Operations
const visitorService = new VisitorService()

builder.queryFields((t) => ({
  journeyVisitorsConnection: t.field({
    type: JourneyVisitorsConnection,
    args: {
      filter: t.arg({
        type: JourneyVisitorFilter,
        required: true
      }),
      first: t.arg.int({ required: false }),
      after: t.arg.string({ required: false }),
      sort: t.arg({
        type: JourneyVisitorSort,
        required: false
      })
    },
    authScopes: { authenticated: true },
    resolve: async (_parent, args, context) => {
      const { filter, first = 50, after, sort } = args

      // Build the where clause for authorization
      const whereFilter = visitorService.generateJourneyVisitorWhere(filter)

      // Fetch journey visitors with full ACL includes
      const journeyVisitors = await prisma.journeyVisitor.findMany({
        where: whereFilter,
        include: {
          visitor: {
            include: {
              team: {
                include: { userTeams: true }
              }
            }
          },
          journey: {
            include: {
              userJourneys: true,
              team: {
                include: { userTeams: true }
              }
            }
          }
        }
      })

      // Filter based on ACL permissions
      const accessibleJourneyVisitors = journeyVisitors.filter(
        (journeyVisitor) =>
          ability(
            Action.Read,
            abilitySubject('JourneyVisitor', journeyVisitor),
            context.user
          )
      )

      // Extract IDs for the final query
      const accessibleIds = accessibleJourneyVisitors.map((jv) => jv.id)

      // Build final query filter
      const finalFilter = {
        AND: [
          whereFilter,
          {
            id: {
              in: accessibleIds
            }
          }
        ]
      }

      return await visitorService.getJourneyVisitorList({
        filter: finalFilter,
        first,
        after,
        sort
      })
    }
  }),

  journeyVisitorCount: t.field({
    type: 'Int',
    args: {
      filter: t.arg({
        type: JourneyVisitorFilter,
        required: true
      })
    },
    authScopes: { authenticated: true },
    resolve: async (_parent, args, context) => {
      const { filter } = args

      // Build the where clause for authorization
      const whereFilter = visitorService.generateJourneyVisitorWhere(filter)

      // Fetch journey visitors with full ACL includes
      const journeyVisitors = await prisma.journeyVisitor.findMany({
        where: whereFilter,
        include: {
          visitor: {
            include: {
              team: {
                include: { userTeams: true }
              }
            }
          },
          journey: {
            include: {
              userJourneys: true,
              team: {
                include: { userTeams: true }
              }
            }
          }
        }
      })

      // Filter based on ACL permissions
      const accessibleJourneyVisitors = journeyVisitors.filter(
        (journeyVisitor) =>
          ability(
            Action.Read,
            abilitySubject('JourneyVisitor', journeyVisitor),
            context.user
          )
      )

      // Return count of accessible journey visitors
      return accessibleJourneyVisitors.length
    }
  })
})))
