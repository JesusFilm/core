import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'

import { VideoTriggerBlockUpdateInput } from './inputs'
import { VideoTriggerBlock } from './videoTrigger'

builder.mutationField('videoTriggerBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: VideoTriggerBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: VideoTriggerBlockUpdateInput, required: true }),
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
        throw new GraphQLError('video trigger block not found', {
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
        throw new GraphQLError(
          'user is not allowed to update video trigger block',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.triggerStart !== undefined)
          updateData.triggerStart = input.triggerStart

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
