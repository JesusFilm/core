import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { builder } from '../../builder'

import { StepBlockPositionUpdateInput } from './inputs'
import { StepBlock } from './step'

builder.mutationField('stepBlockPositionUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: [StepBlock],
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({
        type: [StepBlockPositionUpdateInput],
        required: { list: true, items: true }
      })
    },
    resolve: async (_parent, { input }, context) => {
      if (input.length === 0) return []

      const blocks = await prisma.block.findMany({
        where: {
          id: { in: input.map(({ id }) => id) },
          deletedAt: null
        },
        include: {
          action: true,
          journey: {
            include: {
              team: { include: { userTeams: true } },
              userJourneys: true
            }
          }
        }
      })

      if (blocks.length !== input.length)
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      blocks.forEach((block) => {
        if (
          !ability(
            Action.Update,
            abilitySubject('Journey', block.journey),
            context.user
          )
        )
          throw new GraphQLError('user is not allowed to update block', {
            extensions: { code: 'FORBIDDEN' }
          })
      })

      return await prisma.$transaction(async (tx) => {
        await tx.journey.update({
          where: { id: blocks[0].journeyId },
          data: { updatedAt: new Date().toISOString() }
        })

        return await Promise.all(
          input.map(
            async (item) =>
              await tx.block.update({
                where: { id: item.id },
                data: { x: item.x, y: item.y }
              })
          )
        )
      })
    }
  })
)
