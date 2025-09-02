import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { INCLUDE_JOURNEY_ACL } from '../../journey/journey.acl'
import { canBlockHaveAction } from '../canBlockHaveAction'

import { PhoneActionInput } from './inputs'
import { PhoneActionRef } from './phoneAction'

const phoneRegex = /^\+?[1-9]\d{1,14}$/

builder.mutationField('blockUpdatePhoneAction', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: PhoneActionRef,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: PhoneActionInput, required: true }),
      journeyId: t.arg.id({ required: false })
    },
    nullable: false,
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      const block = await prisma.block.findUnique({
        where: { id },
        include: {
          action: true,
          ...INCLUDE_JOURNEY_ACL
        }
      })

      if (block == null) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (
        !ability(Action.Update, subject('Journey', block.journey as any), user)
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      if (!canBlockHaveAction(block)) {
        throw new GraphQLError('This block does not support phone actions', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      if (input.phone == null || !phoneRegex.test(input.phone)) {
        throw new GraphQLError('must be a valid phone number', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

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
