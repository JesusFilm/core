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

import { ImageBlock } from './image'
import { ImageBlockCreateInput } from './inputs'

builder.mutationField('imageBlockCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: ImageBlock,
    nullable: false,
    args: {
      input: t.arg({ type: ImageBlockCreateInput, required: true })
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
        throw new GraphQLError('user is not allowed to create image block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        const blockId = input.id ?? uuidv4()
        const parentOrder = await getNextParentOrder(
          input.journeyId,
          input.parentBlockId ?? null
        )

        const blockData = {
          id: blockId,
          journeyId: input.journeyId,
          typename: 'ImageBlock',
          parentBlockId: input.parentBlockId,
          parentOrder,
          src: input.src,
          alt: input.alt,
          width: input.width ?? 0,
          height: input.height ?? 0,
          blurhash: input.blurhash ?? '',
          scale: input.scale,
          focalTop: input.focalTop,
          focalLeft: input.focalLeft
        }

        const imageBlock = await tx.block.create({
          data: blockData
        })

        // If this is a cover image, update the parent block's coverBlockId
        if (input.isCover && input.parentBlockId) {
          await tx.block.update({
            where: { id: input.parentBlockId },
            data: { coverBlockId: blockId }
          })
        }

        // Update journey timestamp
        await tx.journey.update({
          where: { id: input.journeyId },
          data: { updatedAt: new Date() }
        })

        return imageBlock
      })
    }
  })
)
