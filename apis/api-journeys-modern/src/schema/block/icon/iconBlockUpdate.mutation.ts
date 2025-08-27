import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'

import { IconBlock } from './icon'
import { IconBlockUpdateInput } from './inputs'

builder.mutationField('iconBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: IconBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: IconBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)
      if (!blockWithJourney) {
        throw new GraphQLError('icon block not found', {
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
        throw new GraphQLError('user is not allowed to update icon block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.name !== undefined) updateData.name = input.name
        if (input.color !== undefined) updateData.color = input.color
        if (input.size !== undefined) updateData.size = input.size

        const updatedBlock = await tx.block.update({
          where: { id },
          data: updateData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: blockWithJourney.journeyId },
          data: { updatedAt: new Date() }
        })

        return updatedBlock
      })
    }
  })
)
