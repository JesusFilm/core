import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'

import { TextResponseBlockUpdateInput } from './inputs'
import { TextResponseBlock } from './textResponse'

builder.mutationField('textResponseBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: TextResponseBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: TextResponseBlockUpdateInput, required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args

      const blockWithJourney = await fetchBlockWithJourneyAcl(id)

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', blockWithJourney.journey),
          context.user
        )
      ) {
        throw new GraphQLError(
          'user is not allowed to update text response block',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.label !== undefined) updateData.label = input.label
        if (input.placeholder !== undefined)
          updateData.placeholder = input.placeholder
        if (input.required !== undefined) updateData.required = input.required
        if (input.hint !== undefined) updateData.hint = input.hint
        if (input.minRows !== undefined) updateData.minRows = input.minRows
        if (input.routeId !== undefined) updateData.routeId = input.routeId
        if (input.type !== undefined) updateData.type = input.type
        if (input.integrationId !== undefined)
          updateData.integrationId = input.integrationId

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
