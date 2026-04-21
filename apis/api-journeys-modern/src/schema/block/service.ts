import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

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

export interface BlockDuplicateIdMap {
  oldId: string
  newId: string
}

async function getDuplicateBlockAndChildren(
  id: string,
  journeyId: string,
  parentBlockId: string | null,
  isStepBlock: boolean,
  duplicateId?: string,
  idMap?: BlockDuplicateIdMap[]
): Promise<BlockWithAction[]> {
  const block = await prisma.block.findUnique({
    where: { id, deletedAt: null },
    include: { action: true }
  })
  if (block == null) {
    throw new Error("Block doesn't exist")
  }

  const duplicateBlockId = duplicateId ?? uuidv4()

  const children = await prisma.block.findMany({
    where: { parentBlockId: block.id, journeyId, deletedAt: null },
    include: { action: true },
    orderBy: { parentOrder: 'asc' }
  })
  const childIds = new Map<string, string>()
  children.forEach((child) => {
    const duplicatedChildId = idMap?.find(
      (map) => map.oldId === child.id
    )?.newId
    childIds.set(child.id, duplicatedChildId ?? uuidv4())
  })

  const updatedBlockProps: Record<string, unknown> = {}
  Object.keys(block).forEach((key) => {
    if (key === 'nextBlockId') {
      updatedBlockProps[key] = null
    } else if (key.includes('BlockId') || key.includes('IconId')) {
      const blockId: string | null | undefined = (block as Record<string, unknown>)[key] as string | null | undefined
      updatedBlockProps[key] = blockId != null ? childIds.get(blockId) : null
    }
    if (key === 'action') {
      const action = omit(block.action, 'parentBlockId') as unknown as Action
      updatedBlockProps[key] = action
    }
    if (key === 'submitEnabled' && (block as Record<string, unknown>)[key] === true && !isStepBlock) {
      updatedBlockProps[key] = false
    }
  })

  const duplicateBlock = {
    ...block,
    ...updatedBlockProps,
    id: duplicateBlockId,
    journeyId: block.journeyId,
    parentBlockId
  }

  const duplicateChildren = await getDuplicateChildren(
    children,
    journeyId,
    duplicateBlockId,
    isStepBlock,
    childIds,
    idMap
  )

  return [duplicateBlock as BlockWithAction, ...duplicateChildren]
}

async function getDuplicateChildren(
  children: BlockWithAction[],
  journeyId: string,
  parentBlockId: string | null,
  isStepBlock: boolean,
  duplicateIds: Map<string, string>,
  idMap?: BlockDuplicateIdMap[]
): Promise<BlockWithAction[]> {
  const duplicateChildren = await Promise.all(
    children.map(async (child) => {
      return await getDuplicateBlockAndChildren(
        child.id,
        journeyId,
        parentBlockId,
        isStepBlock,
        duplicateIds.get(child.id),
        idMap
      )
    })
  )
  return duplicateChildren.reduce((acc, val) => acc.concat(val), [])
}

export async function duplicateBlock(
  block: BlockWithAction,
  isStepBlock: boolean,
  parentOrder?: number | null,
  idMap?: BlockDuplicateIdMap[],
  x?: number | null,
  y?: number | null
): Promise<BlockWithAction[]> {
  const duplicateBlockId = idMap?.find((map) => block.id === map.oldId)?.newId
  const blockAndChildrenData = await getDuplicateBlockAndChildren(
    block.id,
    block.journeyId,
    block.parentBlockId ?? null,
    isStepBlock,
    duplicateBlockId,
    idMap
  )

  await Promise.all(
    blockAndChildrenData.map(async (b) =>
      prisma.block.create({
        data: {
          ...omit(b, [
            ...OMITTED_BLOCK_FIELDS,
            'parentBlockId',
            'posterBlockId',
            'coverBlockId',
            'nextBlockId',
            'action',
            'slug',
            'pollOptionImageBlockId'
          ]),
          customizable: false,
          settings: b.settings ?? {},
          journey: { connect: { id: b.journeyId } }
        } as unknown as Prisma.BlockCreateInput
      })
    )
  )

  const duplicateBlockAndChildren = await Promise.all(
    blockAndChildrenData.map(async (newBlock) => {
      if (
        newBlock.parentBlockId != null ||
        newBlock.posterBlockId != null ||
        newBlock.coverBlockId != null ||
        newBlock.nextBlockId != null ||
        newBlock.pollOptionImageBlockId != null ||
        newBlock.action != null
      ) {
        const isActionEmpty = Object.keys(newBlock.action ?? {}).length === 0
        const updateBlockData = {
          parentBlockId: newBlock.parentBlockId ?? undefined,
          posterBlockId: newBlock.posterBlockId ?? undefined,
          coverBlockId: newBlock.coverBlockId ?? undefined,
          nextBlockId: newBlock.nextBlockId ?? undefined,
          pollOptionImageBlockId:
            newBlock.pollOptionImageBlockId ?? undefined,
          action:
            !isActionEmpty && newBlock.action != null
              ? {
                  create: {
                    ...newBlock.action,
                    customizable: false,
                    parentStepId: null
                  }
                }
              : undefined
        }
        if (newBlock.typename === 'StepBlock') {
          return await prisma.block.update({
            where: { id: newBlock.id },
            include: { action: true },
            data: {
              ...updateBlockData,
              x: x ?? newBlock.x,
              y: y ?? newBlock.y
            }
          })
        }
        return await prisma.block.update({
          where: { id: newBlock.id },
          include: { action: true },
          data: updateBlockData
        })
      }
      return newBlock
    })
  )

  const duplicatedBlock = duplicateBlockAndChildren[0]
  const duplicatedChildren = duplicateBlockAndChildren.slice(1)

  const siblings = await getSiblingsInternal(
    block.journeyId,
    block.parentBlockId
  )
  const defaultDuplicateBlockIndex = siblings.findIndex(
    (s) => s.id === duplicatedBlock.id
  )
  const insertIndex =
    parentOrder != null ? parentOrder : siblings.length + 1
  siblings.splice(defaultDuplicateBlockIndex, 1)
  siblings.splice(insertIndex, 0, duplicatedBlock)
  const reorderedBlocks = await reorderSiblings(siblings)

  return reorderedBlocks.concat(duplicatedChildren)
}
