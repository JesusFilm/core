import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { builder } from '../builder'

import { Block } from './block'
import { BlockDuplicateIdMapInput } from './inputs'
import { duplicateBlock } from './service'

builder.mutationField('blockDuplicate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: [Block],
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentOrder: t.arg({ type: 'Int', required: false }),
      idMap: t.arg({ type: [BlockDuplicateIdMapInput], required: false }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      }),
      x: t.arg({ type: 'Int', required: false }),
      y: t.arg({ type: 'Int', required: false })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentOrder, idMap, x, y } = args

      const block = await fetchBlockWithJourneyAcl(id)
      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      ) {
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      const isStepBlock = block.typename === 'StepBlock'

      const result = await prisma.$transaction(async (tx) => {
        const duplicatedBlocks = await duplicateBlock(
          block,
          isStepBlock,
          parentOrder,
          idMap ?? undefined,
          x,
          y
        )
        await tx.journey.update({
          where: { id: block.journeyId },
          data: { updatedAt: new Date().toISOString() }
        })
        return duplicatedBlocks
      })
      await recalculateJourneyCustomizable(block.journeyId)
      return result
    }
  })
)
