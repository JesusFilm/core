import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { Block } from '../block'
import { builder } from '../builder'

import { canBlockHaveAction } from './canBlockHaveAction'

builder.mutationField('blockDeleteAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: Block,
    args: {
      id: t.arg.id({ required: true }),
      journeyId: t.arg.id({ required: false })
    },
    nullable: false,
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (!block) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!ability(Action.Update, subject('Journey', block.journey), user)) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      // Delete the action if it exists
      await prisma.action.deleteMany({ where: { parentBlockId: id } })

      return block
    }
  })
)
