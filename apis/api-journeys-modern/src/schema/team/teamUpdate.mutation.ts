import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { TeamUpdateInput } from './inputs'
import { TeamRef } from './team'
import { Action, INCLUDE_TEAM_ACL, teamAcl } from './team.acl'

builder.mutationField('teamUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: TeamRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: TeamUpdateInput, required: false })
      },
      resolve: async (query, _parent, args, context) => {
        const team = await prisma.team.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_TEAM_ACL
        })

        if (team == null)
          throw new GraphQLError('team not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!teamAcl(Action.Update, team, context.user))
          throw new GraphQLError('user is not allowed to update team', {
            extensions: { code: 'FORBIDDEN' }
          })

        const data: { title?: string; publicTitle?: string | null } = {}
        if (args.input?.title != null) data.title = args.input.title
        if (args.input?.publicTitle !== undefined)
          data.publicTitle = args.input.publicTitle

        return prisma.team.update({
          ...query,
          where: { id: String(args.id) },
          data
        })
      }
    })
)
