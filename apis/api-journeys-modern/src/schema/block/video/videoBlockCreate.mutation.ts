import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { fetchJourneyWithAclIncludes } from '../../../lib/auth/fetchJourneyWithAclIncludes'
import { builder } from '../../builder'
import { getNextParentOrder } from '../getNextParentOrder'

import { VideoBlockCreateInput } from './inputs'
import { VideoBlock } from './video'

builder.mutationField('videoBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: VideoBlock,
    nullable: false,
    args: {
      input: t.arg({ type: VideoBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args

      const journey = await fetchJourneyWithAclIncludes(input.journeyId)
      if (!journey) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check permissions using ACL
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to create video block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const parentOrder = await getNextParentOrder(
          input.journeyId,
          input.parentBlockId
        )

        const blockData = {
          id: input.id ?? uuidv4(),
          journeyId: input.journeyId,
          typename: 'VideoBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          videoId: input.videoId,
          videoVariantLanguageId: input.videoVariantLanguageId,
          source: input.source ?? 'internal',
          title: input.title,
          description: input.description,
          image: input.image,
          duration: input.duration,
          objectFit: input.objectFit,
          startAt: input.startAt,
          endAt: input.endAt,
          muted: input.muted ?? false,
          autoplay: input.autoplay ?? false,
          fullsize: input.fullsize ?? false,
          posterBlockId: input.posterBlockId
        }

        const videoBlock = await tx.block.create({
          data: blockData
        })

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return videoBlock
      })
    }
  })
)
