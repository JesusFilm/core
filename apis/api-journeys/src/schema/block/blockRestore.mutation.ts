import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import {
  Action,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { builder } from '../builder'
import { INCLUDE_JOURNEY_ACL } from '../journey/journey.acl'

import { Block } from './block'
import { BlockWithAction, reorderBlock } from './service'

builder.mutationField('blockRestore', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: [Block],
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args

      const block = await prisma.block.findUnique({
        where: { id: String(id) },
        include: {
          action: true,
          ...INCLUDE_JOURNEY_ACL
        }
      })

      if (block == null)
        throw new GraphQLError('block not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      if (
        !ability(
          Action.Update,
          abilitySubject('Journey', block.journey),
          context.user
        )
      )
        throw new GraphQLError('user is not allowed to update block', {
          extensions: { code: 'FORBIDDEN' }
        })

      const result = await prisma.$transaction(async (tx) => {
        const updatedBlock = await tx.block.update({
          where: { id: String(id) },
          data: { deletedAt: null },
          include: { action: true }
        })

        let siblings: BlockWithAction[] = [updatedBlock]
        if (updatedBlock.parentOrder != null)
          siblings = await reorderBlock(
            updatedBlock,
            updatedBlock.parentOrder,
            tx
          )

        const blocks = await tx.block.findMany({
          where: {
            journeyId: updatedBlock.journeyId,
            deletedAt: null,
            NOT: { id: updatedBlock.id }
          },
          include: { action: true }
        })

        const children = getDescendants(updatedBlock.id, blocks)

        await tx.journey.update({
          where: { id: updatedBlock.journeyId },
          data: { updatedAt: new Date().toISOString() }
        })

        return {
          blocks: [...siblings, ...children],
          journeyId: updatedBlock.journeyId
        }
      })

      await recalculateJourneyCustomizable(result.journeyId)
      return result.blocks
    }
  })
)

function getDescendants(
  parentBlockId: string,
  blocks: BlockWithAction[]
): BlockWithAction[] {
  const result: BlockWithAction[] = []
  for (const block of blocks) {
    if (block.parentBlockId === parentBlockId) {
      result.push(block)
      result.push(...getDescendants(block.id, blocks))
    }
  }
  return result
}
