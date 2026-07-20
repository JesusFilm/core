import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  authorizeBlockCreate,
  getSiblingsInternal,
  setJourneyUpdatedAt,
  validateParentBlock
} from '../service'

import { TypographyBlockCreateInput } from './inputs'
import { TypographyBlock } from './typography'

builder.mutationField('typographyBlockCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: TypographyBlock,
    nullable: false,
    args: {
      input: t.arg({ type: TypographyBlockCreateInput, required: true })
    },
    resolve: async (_parent, { input }, context) => {
      await authorizeBlockCreate(input.journeyId, context.user)
      await validateParentBlock(input.parentBlockId, input.journeyId)

      return await prisma.$transaction(async (tx) => {
        const siblings = await getSiblingsInternal(
          input.journeyId,
          input.parentBlockId,
          tx
        )

        const block = await tx.block.create({
          data: {
            id: input.id ?? undefined,
            typename: 'TypographyBlock',
            content: input.content,
            variant: input.variant ?? undefined,
            color: input.color ?? undefined,
            align: input.align ?? undefined,
            settings: (input.settings ?? {}) as Prisma.JsonObject,
            journey: { connect: { id: input.journeyId } },
            parentBlock: { connect: { id: input.parentBlockId } },
            parentOrder: siblings.length
          }
        })

        await setJourneyUpdatedAt(tx, block)

        return block
      })
    }
  })
)
