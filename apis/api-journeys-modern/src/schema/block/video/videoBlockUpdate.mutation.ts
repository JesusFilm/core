import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../../builder'

import { VideoBlockUpdateInput } from './inputs'
import { VideoBlock } from './video'

builder.mutationField('videoBlockUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: VideoBlock,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: VideoBlockUpdateInput, required: true }),
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
        throw new GraphQLError('user is not allowed to update video block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const updateData: any = {}

        if (input.parentBlockId !== undefined)
          updateData.parentBlockId = input.parentBlockId
        if (input.videoId !== undefined) updateData.videoId = input.videoId
        if (input.videoVariantLanguageId !== undefined)
          updateData.videoVariantLanguageId = input.videoVariantLanguageId
        if (input.posterBlockId !== undefined)
          updateData.posterBlockId = input.posterBlockId
        if (input.title !== undefined) updateData.title = input.title
        if (input.description !== undefined)
          updateData.description = input.description
        if (input.image !== undefined) updateData.image = input.image
        if (input.duration !== undefined) updateData.duration = input.duration
        if (input.objectFit !== undefined)
          updateData.objectFit = input.objectFit
        if (input.startAt !== undefined) updateData.startAt = input.startAt
        if (input.endAt !== undefined) updateData.endAt = input.endAt
        if (input.muted !== undefined) updateData.muted = input.muted
        if (input.autoplay !== undefined) updateData.autoplay = input.autoplay
        if (input.fullsize !== undefined) updateData.fullsize = input.fullsize

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
