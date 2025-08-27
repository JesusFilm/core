import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'
import { getNextParentOrder } from '../getNextParentOrder'

import { RadioOptionBlockUpdateInput } from './inputs'
import { RadioOptionBlock } from './radioOption'

builder.mutationField('radioOptionBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: RadioOptionBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: RadioOptionBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const { parentBlockId, label } = input

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
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (parentBlockId !== undefined) {
          updateData.parentBlockId = parentBlockId
          if (parentBlockId !== null) {
            updateData.parentOrder = await getNextParentOrder(
              blockWithJourney.journeyId,
              parentBlockId
            )
          }
        }

        if (label !== undefined) {
          updateData.label = label
        }

        const block = await tx.block.update({
          where: { id },
          data: updateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        return block
      })
    }
  })
)
