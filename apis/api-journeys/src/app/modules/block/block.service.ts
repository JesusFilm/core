import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { ToPostgresql } from '@core/nest/decorators/ToPostgresql'
import { Action, Block, Prisma } from '@core/prisma/journeys/client'

import { BlockDuplicateIdMap } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

export const OMITTED_BLOCK_FIELDS = ['__typename', 'journeyId', 'isCover']

export type BlockWithAction = Block & { action: Action | null }

type PrismaTransation = Omit<
  PrismaService,
  | '$connect'
  | '$disconnect'
  | '$on'
  | '$transaction'
  | '$use'
  | '$extends'
  | 'onModuleInit'
  | 'enableShutdownHooks'
>

@Injectable()
export class BlockService {
  constructor(private readonly prismaService: PrismaService) {}

  async findParentStepBlock(id?: string): Promise<Block | undefined> {
    const block = await this.prismaService.block.findUnique({ where: { id } })
    if (block?.parentBlockId == null) {
      if (block?.typename === 'StepBlock') return block
      return
    }
    return await this.findParentStepBlock(block.parentBlockId)
  }

  async setJourneyUpdatedAt(tx: PrismaTransation, block: Block): Promise<void> {
    await tx.journey.update({
      where: {
        id: block.journeyId
      },
      data: { updatedAt: block.updatedAt }
    })
  }

  @FromPostgresql()
  async getSiblings(
    journeyId: string,
    parentBlockId?: string | null
  ): Promise<BlockWithAction[]> {
    return await this.getSiblingsInternal(journeyId, parentBlockId)
  }

  async getSiblingsInternal(
    journeyId: string,
    parentBlockId?: string | null,
    tx: PrismaTransation = this.prismaService,
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

  async reorderSiblings(
    siblings: BlockWithAction[],
    tx: PrismaTransation = this.prismaService
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

  @FromPostgresql()
  async reorderBlock(
    block: BlockWithAction,
    parentOrder: number,
    tx: PrismaTransation = this.prismaService
  ): Promise<BlockWithAction[]> {
    if (block.parentOrder == null) return []

    const siblings = await this.getSiblingsInternal(
      block.journeyId,
      block.parentBlockId,
      tx,
      { id: { not: block.id } }
    )

    siblings.splice(parentOrder, 0, block)
    return await this.reorderSiblings(siblings, tx)
  }

  @FromPostgresql()
  async duplicateBlock(
    block: BlockWithAction,
    isStepBlock: boolean,
    parentOrder?: number,
    idMap?: BlockDuplicateIdMap[],
    x?: number,
    y?: number
  ): Promise<BlockWithAction[]> {
    const duplicateBlockId = idMap?.find((map) => block.id === map.oldId)?.newId
    const blockAndChildrenData = await this.getDuplicateBlockAndChildren(
      block.id,
      block.journeyId,
      block.parentBlockId ?? null,
      isStepBlock,
      duplicateBlockId,
      idMap
    )
    await this.saveAll(
      blockAndChildrenData.map((block) => ({
        ...omit(block, [
          'parentBlockId',
          'posterBlockId',
          'coverBlockId',
          'nextBlockId',
          'action',
          'slug'
        ]),
        settings: block.settings ?? {},
        journey: {
          connect: { id: block.journeyId }
        }
      }))
    )
    const duplicateBlockAndChildren = await Promise.all(
      blockAndChildrenData.map(async (newBlock) => {
        if (
          newBlock.parentBlockId != null ||
          newBlock.posterBlockId != null ||
          newBlock.coverBlockId != null ||
          newBlock.nextBlockId != null ||
          newBlock.action != null
        ) {
          const isActionEmpty = Object.keys(newBlock.action ?? {}).length === 0
          const updateBlockData = {
            parentBlockId: newBlock.parentBlockId ?? undefined,
            posterBlockId: newBlock.posterBlockId ?? undefined,
            coverBlockId: newBlock.coverBlockId ?? undefined,
            nextBlockId: newBlock.nextBlockId ?? undefined,
            action:
              !isActionEmpty && newBlock.action != null
                ? { create: newBlock.action }
                : undefined
          }
          if (newBlock.typename === 'StepBlock') {
            return await this.prismaService.block.update({
              where: { id: newBlock.id },
              include: { action: true },
              data: {
                ...updateBlockData,
                x: x ?? newBlock.x,
                y: y ?? newBlock.y
              }
            })
          } else {
            return await this.prismaService.block.update({
              where: { id: newBlock.id },
              include: { action: true },
              data: updateBlockData
            })
          }
        }

        return newBlock
      })
    )
    const duplicatedBlock = duplicateBlockAndChildren[0]
    const duplicatedChildren = duplicateBlockAndChildren.slice(1)

    // Newly duplicated block returns with original block and siblings.
    const siblings = await this.getSiblingsInternal(
      block.journeyId,
      block.parentBlockId
    )
    const defaultDuplicateBlockIndex = siblings.findIndex(
      (block) => block.id === duplicatedBlock.id
    )
    const insertIndex = parentOrder != null ? parentOrder : siblings.length + 1
    siblings.splice(defaultDuplicateBlockIndex, 1)
    siblings.splice(insertIndex, 0, duplicatedBlock)
    const reorderedBlocks = await this.reorderSiblings(siblings)

    return reorderedBlocks.concat(duplicatedChildren)
  }

  async getDuplicateChildren(
    children: BlockWithAction[],
    journeyId: string,
    parentBlockId: string | null,
    isStepBlock: boolean,
    // Use to custom set children blockIds
    duplicateIds: Map<string, string>,
    idMap?: BlockDuplicateIdMap[],
    // Below 2 only used when duplicating journeys
    duplicateJourneyId?: string,
    duplicateStepIds?: Map<string, string>
  ): Promise<BlockWithAction[]> {
    const duplicateChildren = await Promise.all(
      children.map(async (block) => {
        return await this.getDuplicateBlockAndChildren(
          block.id,
          journeyId,
          parentBlockId,
          isStepBlock,
          duplicateIds.get(block.id),
          idMap,
          duplicateJourneyId,
          duplicateStepIds
        )
      })
    )

    return duplicateChildren.reduce((acc, val) => {
      return acc.concat(val)
    }, [])
  }

  async getDuplicateBlockAndChildren(
    id: string,
    journeyId: string,
    parentBlockId: string | null,
    isStepBlock: boolean,
    duplicateId?: string,
    idMap?: BlockDuplicateIdMap[],
    // Below 2 only used when duplicating journeys
    duplicateJourneyId?: string,
    duplicateStepIds?: Map<string, string>
  ): Promise<BlockWithAction[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id, deletedAt: null },
      include: { action: true }
    })
    if (block == null) {
      throw new Error("Block doesn't exist")
    }

    const duplicateBlockId = duplicateId ?? uuidv4()

    const children = await this.prismaService.block.findMany({
      where: { parentBlockId: block.id, journeyId, deletedAt: null },
      include: { action: true },
      orderBy: { parentOrder: 'asc' }
    })
    const childIds = new Map<string, string>()
    children.forEach((block) => {
      const duplicatedChildId = idMap?.find(
        (map) => map.oldId === block.id
      )?.newId
      childIds.set(block.id, duplicatedChildId ?? uuidv4())
    })
    const updatedBlockProps: Partial<BlockWithAction> = {}
    Object.keys(block).forEach((key) => {
      if (key === 'nextBlockId') {
        updatedBlockProps[key] =
          duplicateStepIds != null && block.nextBlockId != null
            ? duplicateStepIds.get(block.nextBlockId)
            : null
        // All ids that link to child blocks should include BlockId in the key name.
        // TODO: startIconId and endIconId should be renamed as IconBlockId's
      } else if (key.includes('BlockId') || key.includes('IconId')) {
        const blockId: string | null | undefined = block[key]
        updatedBlockProps[key] = blockId != null ? childIds.get(blockId) : null
      }
      if (key === 'action') {
        const action = omit(block.action, 'parentBlockId') as unknown as Action
        updatedBlockProps[key] =
          action?.blockId != null && duplicateStepIds != null
            ? {
                ...action,
                blockId: duplicateStepIds.get(action.blockId) ?? action.blockId
              }
            : action
      }
      if (
        key === 'submitEnabled' &&
        block[key] === true &&
        duplicateJourneyId == null &&
        !isStepBlock
      ) {
        updatedBlockProps[key] = false
      }
    })
    const defaultDuplicateBlock = {
      id: duplicateBlockId,
      journeyId: duplicateJourneyId ?? block.journeyId,
      parentBlockId
    }
    const duplicateBlock = {
      ...block,
      ...updatedBlockProps,
      ...defaultDuplicateBlock
    }

    const duplicateChildren = await this.getDuplicateChildren(
      children,
      journeyId,
      duplicateBlockId,
      isStepBlock,
      childIds,
      idMap,
      duplicateJourneyId,
      duplicateStepIds
    )

    return [duplicateBlock as BlockWithAction, ...duplicateChildren]
  }

  async removeDescendantsOfDeletedBlocks(
    blocks: BlockWithAction[]
  ): Promise<BlockWithAction[]> {
    let filteredBlocks = blocks
    let length = filteredBlocks.length
    do {
      length = filteredBlocks.length
      const ids: string[] = filteredBlocks.map(({ id }) => id)

      filteredBlocks = filteredBlocks.filter(
        (block) =>
          block.parentBlockId == null || ids.includes(block.parentBlockId)
      )
    } while (length !== filteredBlocks.length)

    return filteredBlocks
  }

  @FromPostgresql()
  async removeBlockAndChildren(block: Block): Promise<BlockWithAction[]> {
    return await this.prismaService.$transaction(async (tx) => {
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
      const result = await this.reorderSiblings(
        await this.getSiblingsInternal(
          block.journeyId,
          block.parentBlockId,
          tx
        ),
        tx
      )
      return result
    })
  }

  async validateBlock(
    id: string | null | undefined,
    value: string | null,
    type: 'parentBlockId' | 'journeyId' = 'parentBlockId'
  ): Promise<boolean> {
    const block =
      id != null
        ? await this.prismaService.block.findUnique({
            where: { id, deletedAt: null },
            include: { action: true }
          })
        : null

    return block != null ? block[type] === value : false
  }

  @FromPostgresql()
  async save<T = Block>(input: Prisma.BlockCreateArgs): Promise<T> {
    return (await this.prismaService.block.create({
      ...input,
      data: omit(input.data, OMITTED_BLOCK_FIELDS) as Prisma.BlockCreateInput
    })) as unknown as T
  }

  @FromPostgresql()
  async saveAll<T>(
    inputs: Prisma.BlockCreateInput[] | Prisma.BlockUncheckedCreateInput[]
  ): Promise<T[]> {
    return await Promise.all(
      inputs.map(
        async (input) =>
          (await this.prismaService.block.create({
            data: omit(input, OMITTED_BLOCK_FIELDS) as Prisma.BlockCreateInput
          })) as unknown as T
      )
    )
  }

  async getDescendants(
    parentBlockId: string,
    blocks: Block[],
    result: Block[] = []
  ): Promise<Block[]> {
    for (const childBlock of blocks) {
      if (childBlock.parentBlockId === parentBlockId) {
        result.push(childBlock)
        await this.getDescendants(childBlock.id, blocks, result)
      }
    }

    return result
  }

  @ToPostgresql()
  async update<T>(
    id: string,
    input: Prisma.BlockUpdateInput | Prisma.BlockUncheckedUpdateInput
  ): Promise<T> {
    return await this.prismaService.$transaction(async (tx) => {
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
      await this.setJourneyUpdatedAt(tx, updatedBlock)
      return updatedBlock as unknown as T
    })
  }
}
