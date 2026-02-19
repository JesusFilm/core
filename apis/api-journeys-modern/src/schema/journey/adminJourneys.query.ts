import {
  Prisma,
  JourneyStatus as PrismaJourneyStatus,
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { JourneyStatus } from './enums/journeyStatus'
import { JourneyRef } from './journey'

builder.queryField('adminJourneys', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: [JourneyRef],
      nullable: false,
      args: {
        status: t.arg({ type: [JourneyStatus], required: false }),
        template: t.arg.boolean({ required: false }),
        teamId: t.arg.id({ required: false }),
        useLastActiveTeamId: t.arg.boolean({ required: false })
      },
      resolve: async (query, _parent, args, context) => {
        const userId = context.user.id
        const filter: Prisma.JourneyWhereInput = {}

        if (args.useLastActiveTeamId === true) {
          const profile = await prisma.journeyProfile.findUnique({
            where: { userId }
          })
          if (profile?.lastActiveTeamId != null) {
            filter.teamId = profile.lastActiveTeamId
          }
        }

        if (args.teamId != null) {
          filter.teamId = args.teamId
        } else if (args.template !== true && filter.teamId == null) {
          // if not looking for templates then only return journeys where:
          //   1. the user is an owner or editor
          //   2. not a member of the team
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

        // ACL: only return journeys the user has access to
        const accessibleJourneys: Prisma.JourneyWhereInput = {
          OR: [
            // user is a team manager
            {
              team: {
                userTeams: {
                  some: {
                    userId,
                    role: UserTeamRole.manager
                  }
                }
              }
            },
            // user is a team member
            {
              team: {
                userTeams: {
                  some: {
                    userId,
                    role: UserTeamRole.member
                  }
                }
              }
            },
            // user is a journey owner
            {
              userJourneys: {
                some: {
                  userId,
                  role: UserJourneyRole.owner
                }
              }
            },
            // user is a journey editor
            {
              userJourneys: {
                some: {
                  userId,
                  role: UserJourneyRole.editor
                }
              }
            },
            // published templates are readable by everyone
            {
              template: true,
              status: PrismaJourneyStatus.published
            }
          ]
        }

        return await prisma.journey.findMany({
          ...query,
          where: {
            AND: [accessibleJourneys, filter]
          }
        })
      }
    })
)
