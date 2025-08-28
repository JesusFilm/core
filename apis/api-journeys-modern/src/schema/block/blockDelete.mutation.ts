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

builder.mutationField('blockDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    description:
      'blockDelete returns the updated sibling blocks on successful delete',
    args: {
      id: t.arg({ type: 'ID', required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      }),
      parentBlockId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

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
        throw new GraphQLError('user is not allowed to delete block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Soft delete the block
        await tx.block.update({
          where: { id },
          data: { deletedAt: new Date() }
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
            deletedAt: null,
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' }
        })

        return siblings
      })
    }
  })
)
