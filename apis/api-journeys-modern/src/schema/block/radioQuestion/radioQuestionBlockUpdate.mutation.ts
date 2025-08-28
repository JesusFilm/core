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

import { RadioQuestionBlock } from './radioQuestion'

builder.mutationField('radioQuestionBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: RadioQuestionBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentBlockId: t.arg({ type: 'ID', required: true }),
      gridView: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentBlockId, gridView } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)

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
