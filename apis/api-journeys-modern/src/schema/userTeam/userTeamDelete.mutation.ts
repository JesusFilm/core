import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { queue as emailQueue } from '../../workers/email/queue'
import { builder } from '../builder'
import { logger } from '../logger'

import { UserTeamRef } from './userTeam'
import { Action, INCLUDE_USER_TEAM_ACL, userTeamAcl } from './userTeam.acl'

builder.mutationField('userTeamDelete', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: UserTeamRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        id: t.arg({ type: 'ID', required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const userTeam = await prisma.userTeam.findUnique({
          where: { id: String(args.id) },
          include: INCLUDE_USER_TEAM_ACL
        })

        if (userTeam == null)
          throw new GraphQLError('userTeam not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (!userTeamAcl(Action.Delete, userTeam, context.user))
          throw new GraphQLError('user is not allowed to delete userTeam', {
            extensions: { code: 'FORBIDDEN' }
          })

        const deleted = await prisma.userTeam.delete({
          ...query,
          where: { id: String(args.id) }
        })

        void emailQueue
          .add(
            'team-removed',
            {
              teamName: userTeam.team.title,
              userId: userTeam.userId
            },
            {
              removeOnComplete: true,
              removeOnFail: { age: 24 * 3600 }
            }
          )
          .catch((err) =>
            logger.error(err, 'failed to enqueue team-removed email')
          )

        return deleted
      }
    })
)
