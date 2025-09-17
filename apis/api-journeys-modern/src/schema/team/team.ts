import { GraphQLError } from 'graphql'

import { UserTeamRole, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { TeamCreateInput, TeamUpdateInput } from './inputs'
import { Team as TeamWithIncludes, teamAcl } from './team.acl'

export const TeamRef = builder.prismaObject('Team', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    title: t.exposeString('title', { nullable: false }),
    publicTitle: t.exposeString('publicTitle', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    userTeams: t.relation('userTeams', { nullable: false }),
    customDomains: t.relation('customDomains', { nullable: false }),
    integrations: t.relation('integrations', { nullable: false }),
    qrCodes: t.relation('qrCodes', { nullable: false })
  })
})

// Helper function to fetch Team with ACL includes
async function fetchTeamWithAclIncludes(id: string) {
  return await prisma.team.findUnique({
    where: { id },
    include: {
      userTeams: true
    }
  })
}

// Temporary ACL check - TODO: Implement proper Team ACL integration
function canAccessTeam(
  action: string,
  team: TeamWithIncludes,
  user: any
): boolean {
  return teamAcl(action, team, user)
}

// Queries
builder.queryField('teams', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: [TeamRef],
    resolve: async (_, __, context) => {
      const user = context.user

      // Get teams where user has access (is a member or manager)
      const teams = await prisma.team.findMany({
        where: {
          userTeams: {
            some: {
              userId: user.id
            }
          }
        },
        include: {
          userTeams: true
        }
      })

      // Filter teams based on user abilities
      return teams.filter((team) => canAccessTeam('read', team, user))
    }
  })
)

builder.queryField('team', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: TeamRef,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_, { id }, context) => {
      const user = context.user

      const team = await fetchTeamWithAclIncludes(id)
      if (team == null) {
        throw new GraphQLError('Team not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (canAccessTeam('read', team, user)) {
        return team
      }

      throw new GraphQLError('User is not allowed to view team', {
        extensions: { code: 'FORBIDDEN' }
      })
    }
  })
)

// Mutations
builder.mutationField('teamCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: TeamRef,
    args: {
      input: t.arg({ type: TeamCreateInput, required: true })
    },
    resolve: async (_, { input }, context) => {
      const user = context.user

      // Create team with the current user as manager
      const team = await prisma.team.create({
        data: {
          ...input,
          userTeams: {
            create: {
              userId: user.id,
              role: UserTeamRole.manager
            }
          }
        },
        include: {
          userTeams: true
        }
      })

      return team
    }
  })
)

builder.mutationField('teamUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: TeamRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: TeamUpdateInput, required: true })
    },
    resolve: async (_, { id, input }, context) => {
      const user = context.user

      const team = await fetchTeamWithAclIncludes(id)
      if (team == null) {
        throw new GraphQLError('Team not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!canAccessTeam('update', team, user)) {
        throw new GraphQLError('User is not allowed to update team', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const updatedTeam = await prisma.team.update({
        where: { id },
        data: input,
        include: {
          userTeams: true
        }
      })

      return updatedTeam
    }
  })
)
