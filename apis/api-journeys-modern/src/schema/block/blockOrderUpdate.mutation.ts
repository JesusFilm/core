import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { builder } from '../builder'

import { Block } from './block'
import { reorderBlock } from './service'

builder.mutationField('blockOrderUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: [Block],
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      parentOrder: t.arg({ type: 'Int', required: true }),
      journeyId: t.arg({
        type: 'ID',
        required: false,
        description: 'drop this parameter after merging teams'
      })
    },
    resolve: async (_parent, args, context) => {
      const { id, parentOrder } = args

      // pr to update comment to trigger pr
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

      return await prisma.$transaction(async (tx) => {
        const reorderedBlocks = await reorderBlock(block, parentOrder, tx)
        await tx.journey.update({
          where: { id: block.journeyId },
          data: { updatedAt: new Date().toISOString() }
        })
        return reorderedBlocks
      })
    }
  })
)
