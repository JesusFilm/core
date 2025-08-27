import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'

import { ButtonBlock } from './button'
import { ButtonBlockUpdateInput } from './inputs'

builder.mutationField('buttonBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: ButtonBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ButtonBlockUpdateInput, required: true }),
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
        throw new GraphQLError('button block not found', {
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
        throw new GraphQLError('user is not allowed to update button block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.label !== undefined) updateData.label = input.label
        if (input.variant !== undefined) updateData.variant = input.variant
        if (input.color !== undefined) updateData.color = input.color
        if (input.size !== undefined) updateData.size = input.size
        if (input.startIconId !== undefined)
          updateData.startIconId = input.startIconId
        if (input.endIconId !== undefined)
          updateData.endIconId = input.endIconId
        if (input.submitEnabled !== undefined)
          updateData.submitEnabled = input.submitEnabled
        if (input.settings !== undefined) updateData.settings = input.settings

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
