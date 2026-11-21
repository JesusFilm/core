import omit from 'lodash/omit'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import {
  authorizeBlockCreate,
  getSiblingsInternal,
  setJourneyUpdatedAt
} from '../service'

import { StepBlockCreateInput } from './inputs'
import { StepBlock } from './step'

builder.mutationField('stepBlockCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: StepBlock,
    nullable: false,
    args: {
      input: t.arg({ type: StepBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input: initialInput } = args
      const input = { ...initialInput }

      await authorizeBlockCreate(input.journeyId, context.user)

      return await prisma.$transaction(async (tx) => {
        const siblings = await getSiblingsInternal(input.journeyId, null, tx)
        const lastOrder = siblings.reduce(
          (maximum, sibling) => Math.max(maximum, sibling.parentOrder ?? -1),
          -1
        )
        const block = await tx.block.create({
          data: {
            ...omit(input, 'journeyId', 'nextBlockId'),
            id: input.id ?? undefined,
            typename: 'StepBlock',
            journey: { connect: { id: input.journeyId } },
            nextBlock:
              input.nextBlockId != null
                ? { connect: { id: input.nextBlockId } }
                : undefined,
            parentOrder: lastOrder + 1
          }
        })
        await setJourneyUpdatedAt(tx, block)
        return block
      })
    }
  })
)
