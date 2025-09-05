import { Action, Block, Prisma, prisma } from '@core/prisma/journeys/client'

export type BlockWithAction = Block & { action: Action | null }

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
  block: Block
): Promise<BlockWithAction[]> {
  return await prisma.$transaction(async (tx) => {
    const currentTime = new Date().toISOString()
    const updatedBlock = await tx.block.update({
      where: { id: block.id },
      data: { deletedAt: currentTime }
    })
    await tx.journey.update({
      where: {
        id: updatedBlock.journeyId
      },
      data: { updatedAt: currentTime }
    })
    const result = await reorderSiblings(
      await getSiblingsInternal(block.journeyId, block.parentBlockId, tx),
      tx
    )
    return result
  })
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
  return await prisma.$transaction(async (tx) => {
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
    return updatedBlock as unknown as T
  })
}
