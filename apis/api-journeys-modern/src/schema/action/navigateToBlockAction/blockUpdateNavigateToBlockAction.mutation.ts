import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { canBlockHaveAction } from '../canBlockHaveAction'

import { NavigateToBlockActionInput } from './inputs'
import { NavigateToBlockActionRef } from './navigateToBlockAction'

builder.mutationField('blockUpdateNavigateToBlockAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: NavigateToBlockActionRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: NavigateToBlockActionInput, required: true }),
      journeyId: t.arg.id({ required: false })
    },
    nullable: false,
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Get the block with its journey for authorization
      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
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
        throw new GraphQLError(
          'This block does not support navigate to block actions',
          {
            extensions: { code: 'BAD_USER_INPUT' }
          }
        )
      }

      // Create or update the action
      const action = await prisma.action.upsert({
        where: { parentBlockId: id },
        create: {
          parentBlockId: id,
          ...input
        },
        update: input,
        include: { parentBlock: true }
      })

      return action
    }
  })
)
