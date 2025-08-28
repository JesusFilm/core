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

builder.mutationField('blockRestore', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [Block],
    nullable: false,
    description: 'blockRestore is used for redo/undo',
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      // Fetch block even if deleted for restore operation
      const blockWithJourney = await fetchBlockWithJourneyAcl(id)

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', blockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to restore block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Restore the block by clearing deletedAt
        const restoredBlock = await tx.block.update({
          where: { id },
          data: { deletedAt: null }
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        // Get all blocks in the journey for children restoration
        const allBlocks = await tx.block.findMany({
          where: {
            journeyId: blockWithJourney.journeyId,
            deletedAt: null,
            NOT: { id: restoredBlock.id }
          }
        })

        // Return the restored block and its potential children
        // TODO: Implement proper descendants restoration like legacy service
        return [
          restoredBlock,
          ...allBlocks.filter((b) => b.parentBlockId === restoredBlock.id)
        ]
      })
    }
  })
)
