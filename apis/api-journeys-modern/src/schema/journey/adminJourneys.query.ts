import { GraphQLError } from 'graphql'

import {
  Prisma,
  JourneyStatus as PrismaJourneyStatus,
  UserJourneyRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyStatus } from './enums/journeyStatus'
import { JourneyRef } from './journey'
import { journeyReadAccessWhere } from './journey.acl'

builder.queryField('adminJourneys', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: [JourneyRef],
    nullable: false,
    override: {
      from: 'api-journeys'
    },
    args: {
      status: t.arg({ type: [JourneyStatus], required: false }),
      template: t.arg.boolean({ required: false }),
      teamId: t.arg.id({ required: false }),
      useLastActiveTeamId: t.arg.boolean({ required: false })
    },
    resolve: async (query, _parent, args, context) => {
      const userId = context.user.id
      const currentUser = context.user as typeof context.user & {
        roles?: string[]
      }
      const filter: Prisma.JourneyWhereInput = {}
      let lastActiveApplied = false

      if (args.useLastActiveTeamId === true) {
        const profile = await prisma.journeyProfile.findUnique({
          where: { userId }
        })
        if (profile == null)
          throw new GraphQLError('journey profile not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        lastActiveApplied = true
        if (profile.lastActiveTeamId != null) {
          filter.teamId = profile.lastActiveTeamId
        }
      }

      if (args.teamId != null) {
        filter.teamId = args.teamId
      } else if (
        args.template !== true &&
        filter.teamId == null &&
        !lastActiveApplied
      ) {
        filter.userJourneys = {
          some: {
            userId,
            role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
          }
        }
        filter.team = {
          userTeams: {
            none: {
              userId
            }
          }
        }
      }

      if (args.template != null) filter.template = args.template
      if (args.status != null) {
        filter.status = { in: args.status as PrismaJourneyStatus[] }
      }

      const accessibleJourneys = journeyReadAccessWhere(userId, currentUser)

      return await prisma.journey.findMany({
        ...query,
        where: {
          AND: [accessibleJourneys, filter]
        }
      })
    }
  })
)
