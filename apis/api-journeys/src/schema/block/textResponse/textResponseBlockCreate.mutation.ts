import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  authorizeBlockCreate,
  getSiblingsInternal,
  setJourneyUpdatedAt,
  validateParentBlock
} from '../service'

import { TextResponseBlockCreateInput } from './inputs'
import { TextResponseBlock } from './textResponse'

builder.mutationField('textResponseBlockCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: TextResponseBlock,
    nullable: false,
    args: {
      input: t.arg({ type: TextResponseBlockCreateInput, required: true })
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
            typename: 'TextResponseBlock',
            label: input.label,
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
