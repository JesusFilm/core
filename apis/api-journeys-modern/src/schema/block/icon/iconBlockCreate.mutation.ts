import omit from 'lodash/omit'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  authorizeBlockCreate,
  setJourneyUpdatedAt,
  validateParentBlock
} from '../service'

import { IconBlock } from './icon'
import { IconBlockCreateInput } from './inputs'

builder.mutationField('iconBlockCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: IconBlock,
    nullable: false,
    args: {
      input: t.arg({ type: IconBlockCreateInput, required: true })
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
            typename: 'IconBlock',
            journey: { connect: { id: input.journeyId } },
            parentBlock: { connect: { id: input.parentBlockId } },
            parentOrder: null
          }
        })
        await setJourneyUpdatedAt(tx, block)
        return block
      })
    }
  })
)
