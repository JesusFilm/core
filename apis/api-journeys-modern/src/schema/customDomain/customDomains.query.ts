import {
  Prisma,
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CustomDomainRef } from './customDomain'

function customDomainReadAccessWhere(
  userId: string
): Prisma.CustomDomainWhereInput {
  return {
    OR: [
      {
        team: {
          userTeams: {
            some: {
              userId,
              role: { in: [UserTeamRole.manager, UserTeamRole.member] }
            }
          }
        }
      },
      {
        team: {
          journeys: {
            some: {
              userJourneys: {
                some: {
                  userId,
                  role: {
                    in: [UserJourneyRole.owner, UserJourneyRole.editor]
                  }
                }
              }
            }
          }
        }
      }
    ]
  }
}

builder.queryField('customDomains', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: [CustomDomainRef],
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const accessible = customDomainReadAccessWhere(context.user.id)

      return await prisma.customDomain.findMany({
        ...query,
        where: {
          AND: [accessible, { teamId: args.teamId }]
        }
      })
    }
  })
)
