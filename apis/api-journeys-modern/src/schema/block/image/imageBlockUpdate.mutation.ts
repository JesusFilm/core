import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'

import { ImageBlock } from './image'
import { ImageBlockUpdateInput } from './inputs'

builder.mutationField('imageBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: ImageBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: ImageBlockUpdateInput, required: true }),
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
        throw new GraphQLError('image block not found', {
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
        throw new GraphQLError('user is not allowed to update image block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.src !== undefined) updateData.src = input.src
        if (input.alt !== undefined) updateData.alt = input.alt
        if (input.blurhash !== undefined) updateData.blurhash = input.blurhash
        if (input.width !== undefined) updateData.width = input.width
        if (input.height !== undefined) updateData.height = input.height
        if (input.scale !== undefined) updateData.scale = input.scale
        if (input.focalTop !== undefined) updateData.focalTop = input.focalTop
        if (input.focalLeft !== undefined)
          updateData.focalLeft = input.focalLeft

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
