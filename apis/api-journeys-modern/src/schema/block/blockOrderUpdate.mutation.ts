import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../builder'

import { Block } from './block'

builder.mutationField('blockOrderUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentOrder: t.arg({ type: 'Int', required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentOrder } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)
      if (!blockWithJourney) {
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', blockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block order', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Update the block's parent order
        await tx.block.update({
          where: { id },
          data: { parentOrder }
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        // Return updated siblings
        const siblings = await tx.block.findMany({
          where: {
            journeyId: blockWithJourney.journeyId,
            parentBlockId: blockWithJourney.parentBlockId,
            deletedAt: null
          },
          orderBy: { parentOrder: 'asc' }
        })

        return siblings
      })
    }
  })
)
