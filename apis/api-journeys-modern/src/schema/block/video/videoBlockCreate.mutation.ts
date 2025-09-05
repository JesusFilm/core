import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../../lib/auth/ability'
import { builder } from '../../builder'
import { INCLUDE_JOURNEY_ACL } from '../../journey/journey.acl'
import {
  getSiblingsInternal,
  removeBlockAndChildren,
  setJourneyUpdatedAt
} from '../service'

import { VideoBlockCreateInput } from './inputs'
import {
  fetchFieldsFromMux,
  fetchFieldsFromYouTube,
  videoBlockInternalSchema,
  videoBlockMuxSchema,
  videoBlockYouTubeSchema
} from './service'
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
      const { input: initialInput } = args
      let input = { ...initialInput, source: initialInput.source ?? 'internal' }

      // Check permissions using ACL

      if (input.videoId == null) {
        throw new GraphQLError('videoId is required', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      switch (input.source) {
        case 'youTube':
          videoBlockYouTubeSchema.parse({ videoId: input.videoId })
          input = {
            ...input,
            ...(await fetchFieldsFromYouTube(input.videoId)),
            objectFit: null
          }
          break
        case 'mux':
          videoBlockMuxSchema.parse({ videoId: input.videoId })
          input = {
            ...input,
            ...(await fetchFieldsFromMux(input.videoId)),
            objectFit: null
          }
          break
        case 'internal':
          videoBlockInternalSchema.parse({ videoId: input.videoId })
          break
      }

      return await prisma.$transaction(async (tx) => {
        // Handle cover assignment
        if (input.isCover === true) {
          // Ensure parent exists and remove existing cover block if present
          const parent = await tx.block.findUnique({
            where: { id: input.parentBlockId },
            select: { coverBlock: true }
          })
          if (!parent) {
            throw new GraphQLError('parent block not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }
          if (parent.coverBlock != null) {
            await removeBlockAndChildren(parent.coverBlock)
          }
        }

        const block = await tx.block.create({
          data: {
            ...omit(
              input,
              'parentBlockId',
              'journeyId',
              'posterBlockId',
              'isCover'
            ),
            id: input.id ?? undefined,
            typename: 'VideoBlock',
            journey: { connect: { id: input.journeyId } },
            parentBlock: { connect: { id: input.parentBlockId } },
            posterBlock:
              input.posterBlockId != null
                ? { connect: { id: input.posterBlockId } }
                : undefined,
            parentOrder:
              input.isCover === true
                ? null
                : (
                    await getSiblingsInternal(
                      input.journeyId,
                      input.parentBlockId,
                      tx
                    )
                  ).length,
            coverBlockParent:
              input.isCover === true && input.parentBlockId != null
                ? { connect: { id: input.parentBlockId } }
                : undefined
          },
          include: {
            action: true,
            ...INCLUDE_JOURNEY_ACL
          }
        })
        await setJourneyUpdatedAt(tx, block)
        if (
          !ability(
            Action.Update,
            abilitySubject('Journey', block.journey),
            context.user
          )
        ) {
          throw new GraphQLError('user is not allowed to create block', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        // Duplicate guard: only one VideoBlock per parent
        const existingVideoOnParent = await tx.block.findFirst({
          where: {
            parentBlockId: input.parentBlockId,
            typename: 'VideoBlock',
            id: { not: block.id },
            deletedAt: null
          }
        })
        if (existingVideoOnParent != null) {
          throw new GraphQLError(
            'Parent block already has an existing video block',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
        return block
      })
    }
  })
)
