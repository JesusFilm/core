import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { Action, Block, Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import {
  Action as AuthAction,
  ability,
  subject as abilitySubject
} from '../../lib/auth/ability'
import { fetchBlockWithJourneyAcl } from '../../lib/auth/fetchBlockWithJourneyAcl'
import { fetchJourneyWithAclIncludes } from '../../lib/auth/fetchJourneyWithAclIncludes'
import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'

export const OMITTED_BLOCK_FIELDS = ['__typename', 'journeyId', 'isCover']
export type BlockWithAction = Block & { action: Action | null }

export async function authorizeBlockCreate(
  journeyId: string,
  user: User
): Promise<void> {
  const journey = await fetchJourneyWithAclIncludes(journeyId)
  if (!ability(AuthAction.Update, abilitySubject('Journey', journey), user)) {
    throw new GraphQLError('user is not allowed to create block', {
      extensions: { code: 'FORBIDDEN' }
    })
  }
}

export async function authorizeBlockUpdate(blockId: string, user: User) {
  const block = await fetchBlockWithJourneyAcl(blockId)
  if (
    !ability(AuthAction.Update, abilitySubject('Journey', block.journey), user)
  ) {
    throw new GraphQLError('user is not allowed to update block', {
      extensions: { code: 'FORBIDDEN' }
    })
  }
  return block
}

export async function validateParentBlock(
  parentBlockId: string,
  journeyId: string
): Promise<void> {
  const parentBlock = await prisma.block.findFirst({
    where: {
      id: parentBlockId,
      journeyId,
      deletedAt: null
    }
  })
  if (parentBlock == null) {
    throw new GraphQLError('parent block not found in journey', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }
}

export async function getSiblingsInternal(
  journeyId: string,
  parentBlockId?: string | null,
  tx: Prisma.TransactionClient = prisma,
  where?: Prisma.BlockWhereInput
): Promise<BlockWithAction[]> {
  // Only StepBlocks should not have parentBlockId
  return parentBlockId != null
    ? await tx.block.findMany({
        where: {
          journeyId,
          parentBlockId,
          parentOrder: { not: null },
          deletedAt: null,
          ...where
        },
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })
    : await tx.block.findMany({
        where: {
          journeyId,
          typename: 'StepBlock',
          parentOrder: { not: null },
          deletedAt: null,
          ...where
        },
        orderBy: { parentOrder: 'asc' },
        include: { action: true }
      })
}

export async function removeBlockAndChildren(
  block: Block,
  tx?: Prisma.TransactionClient
): Promise<BlockWithAction[]> {
  const run = async (client: Prisma.TransactionClient) => {
    const currentTime = new Date().toISOString()
    const updatedBlock = await client.block.update({
      where: { id: block.id },
      data: { deletedAt: currentTime }
    })
    await client.journey.update({
      where: {
        id: updatedBlock.journeyId
      },
      data: { updatedAt: currentTime }
    })
    const result = await reorderSiblings(
      await getSiblingsInternal(block.journeyId, block.parentBlockId, client),
      client
    )
    return result
  }

  if (tx != null) return await run(tx)
  return await prisma.$transaction(async (trx) => await run(trx))
}

async function reorderSiblings(
  siblings: BlockWithAction[],
  tx: Prisma.TransactionClient = prisma
): Promise<BlockWithAction[]> {
  return await Promise.all(
    siblings.map(
      async (block, parentOrder) =>
        await tx.block.update({
          where: { id: block.id },
          data: { parentOrder },
          include: { action: true }
        })
    )
  )
}

export async function reorderBlock(
  block: BlockWithAction,
  parentOrder: number,
  tx: Prisma.TransactionClient = prisma
): Promise<BlockWithAction[]> {
  if (block.parentOrder == null) return []

  const siblings = await getSiblingsInternal(
    block.journeyId,
    block.parentBlockId,
    tx,
    { id: { not: block.id } }
  )

  siblings.splice(parentOrder, 0, block)
  return await reorderSiblings(siblings, tx)
}

export async function setJourneyUpdatedAt(
  tx: Prisma.TransactionClient,
  block: Block
): Promise<void> {
  await tx.journey.update({
    where: {
      id: block.journeyId
    },
    data: { updatedAt: block.updatedAt }
  })
}

export async function update<T>(
  id: string,
  input: Prisma.BlockUpdateInput | Prisma.BlockUncheckedUpdateInput
): Promise<T> {
  const result = await prisma.$transaction(async (tx) => {
    if (input.action != null) {
      const data = {
        parentBlock: { connect: { id } },
        ...omit(input.action, 'id')
      }
      await tx.action.upsert({
        where: { parentBlockId: id },
        create: data,
        update: data
      })
    } else if (input.action === null) {
      await tx.action.delete({ where: { parentBlockId: id } })
    }
    const updatedBlock = await tx.block.update({
      where: { id },
      data: omit(input, [
        ...OMITTED_BLOCK_FIELDS,
        'action',
        // deletedAt should only be updated using removeBlockAndChildren
        'deletedAt'
      ]) as Prisma.BlockUpdateInput,
      include: { action: true }
    })
    await setJourneyUpdatedAt(tx, updatedBlock)
    return updatedBlock
  })
  await recalculateJourneyCustomizable(result.journeyId)
  return result as unknown as T
}
