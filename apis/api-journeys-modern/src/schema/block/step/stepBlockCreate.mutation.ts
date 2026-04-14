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
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: StepBlockCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input: initialInput } = args
      const input = { ...initialInput }

      await authorizeBlockCreate(input.journeyId, context.user)

      return await prisma.$transaction(async (tx) => {
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
            parentOrder: (await getSiblingsInternal(input.journeyId, null, tx))
              .length
          }
        })
        await setJourneyUpdatedAt(tx, block)
        return block
      })
    }
  })
)
