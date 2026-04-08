import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  authorizeBlockCreate,
  getSiblingsInternal,
  removeBlockAndChildren,
  setJourneyUpdatedAt
} from '../service'

import { ImageBlock } from './image'
import { ImageBlockCreateInput } from './inputs'
import { transformInput } from './transformInput'

builder.mutationField('imageBlockCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: ImageBlock,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: ImageBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const input = await transformInput({ ...args.input })

      await authorizeBlockCreate(input.journeyId, context.user)

      return await prisma.$transaction(async (tx) => {
        if (input.isCover === true) {
          if (input.parentBlockId == null) {
            throw new GraphQLError(
              'parent block id is required for cover blocks',
              { extensions: { code: 'BAD_USER_INPUT' } }
            )
          }
          const parentBlock = await tx.block.findUnique({
            where: { id: input.parentBlockId },
            include: { coverBlock: true }
          })
          if (parentBlock == null) {
            throw new GraphQLError('parent block not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }
          if (parentBlock.coverBlock != null) {
            await removeBlockAndChildren(parentBlock.coverBlock, tx)
          }
        }

        const block = await tx.block.create({
          data: {
            ...omit(input, 'parentBlockId', 'journeyId', 'isCover'),
            id: input.id ?? undefined,
            typename: 'ImageBlock',
            journey: { connect: { id: input.journeyId } },
            parentBlock:
              input.parentBlockId != null
                ? { connect: { id: input.parentBlockId } }
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
          }
        })
        await setJourneyUpdatedAt(tx, block)
        return block
      })
    }
  })
)
