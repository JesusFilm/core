import omit from 'lodash/omit'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  authorizeBlockCreate,
  getSiblingsInternal,
  setJourneyUpdatedAt,
  validateParentBlock
} from '../service'

import { RadioQuestionBlockCreateInput } from './inputs'
import { RadioQuestionBlock } from './radioQuestion'

builder.mutationField('radioQuestionBlockCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: RadioQuestionBlock,
    nullable: false,
    args: {
      input: t.arg({ type: RadioQuestionBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input: initialInput } = args
      const input = { ...initialInput }

      await authorizeBlockCreate(input.journeyId, context.user)
      await validateParentBlock(input.parentBlockId, input.journeyId)

      return await prisma.$transaction(async (tx) => {
        const block = await tx.block.create({
          data: {
            ...omit(input, 'parentBlockId', 'journeyId'),
            id: input.id ?? undefined,
            typename: 'RadioQuestionBlock',
            journey: { connect: { id: input.journeyId } },
            parentBlock: { connect: { id: input.parentBlockId } },
            parentOrder: (
              await getSiblingsInternal(
                input.journeyId,
                input.parentBlockId,
                tx
              )
            ).length
          }
        })
        await setJourneyUpdatedAt(tx, block)
        return block
      })
    }
  })
)
