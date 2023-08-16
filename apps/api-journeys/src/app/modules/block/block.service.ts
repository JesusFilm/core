import { Injectable } from '@nestjs/common'
import omit from 'lodash/omit'
import { v4 as uuidv4 } from 'uuid'

import { Action, Block, Prisma } from '.prisma/api-journeys-client'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { ToPostgresql } from '@core/nest/decorators/ToPostgresql'

import { PrismaService } from '../../lib/prisma.service'

export const OMITTED_BLOCK_FIELDS = ['__typename', 'journeyId', 'isCover']

type BlockWithAction = Block & { action: Action | null }

@Injectable()
export class BlockService {
  constructor(private readonly prismaService: PrismaService) {}

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
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    > = this.prismaService
  ): Promise<BlockWithAction[]> {
    // Only StepBlocks should not have parentBlockId
    return parentBlockId != null
      ? await tx.block.findMany({
          where: {
            journeyId,
            parentBlockId,
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' },
          include: { action: true }
        })
      : await tx.block.findMany({
          where: {
            journeyId,
            typename: 'StepBlock',
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' },
          include: { action: true }
        })
  }

  async reorderSiblings(
    siblings: BlockWithAction[],
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    > = this.prismaService
  ): Promise<BlockWithAction[]> {
    const updatedSiblings = siblings.map((block, index) => ({
      ...block,
      parentOrder: index
    }))
    return await Promise.all(
      updatedSiblings.map(
        async (block) =>
          await tx.block.update({
            where: { id: block.id },
            data: { parentOrder: block.parentOrder },
            include: { action: true }
          })
      )
    )
  }

  @FromPostgresql()
  async reorderBlock(
    block: BlockWithAction,
    parentOrder: number
  ): Promise<BlockWithAction[]> {
    if (block.parentOrder != null) {
      const siblings = await this.getSiblingsInternal(
        block.journeyId,
        block.parentBlockId
      )
      siblings.splice(block.parentOrder, 1)
      siblings.splice(parentOrder, 0, block)

      return await this.reorderSiblings(siblings)
    }
    return []
  }

  @FromPostgresql()
  async duplicateBlock(
    block: BlockWithAction,
    parentOrder?: number
  ): Promise<BlockWithAction[]> {
    const blockAndChildrenData = await this.getDuplicateBlockAndChildren(
      block.id,
      block.journeyId,
      block.parentBlockId ?? null
    )
    await this.saveAll(
      blockAndChildrenData.map((block) => ({
        ...omit(block, [
          'parentBlockId',
          'posterBlockId',
          'coverBlockId',
          'nextBlockId',
          'action'
        ]),
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
          return await this.prismaService.block.update({
            where: { id: newBlock.id },
            include: { action: true },
            data: {
              parentBlockId: newBlock.parentBlockId ?? undefined,
              posterBlockId: newBlock.posterBlockId ?? undefined,
              coverBlockId: newBlock.coverBlockId ?? undefined,
              nextBlockId: newBlock.nextBlockId ?? undefined,
              action:
                newBlock.action != null
                  ? { create: newBlock.action }
                  : undefined
            }
          })
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
    // Use to custom set children blockIds
    duplicateIds: Map<string, string>,
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
          duplicateIds.get(block.id),
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
    duplicateId?: string,
    // Below 2 only used when duplicating journeys
    duplicateJourneyId?: string,
    duplicateStepIds?: Map<string, string>
  ): Promise<BlockWithAction[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { action: true }
    })
    if (block == null) {
      throw new Error("Block doesn't exist")
    }

    const duplicateBlockId = duplicateId ?? uuidv4()

    const children = await this.prismaService.block.findMany({
      where: { parentBlockId: block.id, journeyId },
      include: { action: true },
      orderBy: { parentOrder: 'asc' }
    })
    const childIds = new Map()
    children.forEach((block) => {
      childIds.set(block.id, uuidv4())
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
        updatedBlockProps[key] = childIds.get(block[key]) ?? null
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
      childIds,
      duplicateJourneyId,
      duplicateStepIds
    )

    return [duplicateBlock as BlockWithAction, ...duplicateChildren]
  }

  @FromPostgresql()
  async removeBlockAndChildren(
    block: Block,
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    > = this.prismaService
  ): Promise<BlockWithAction[]> {
    await tx.block.delete({
      where: { id: block.id }
    })

    const result = await this.reorderSiblings(
      await this.getSiblingsInternal(block.journeyId, block.parentBlockId, tx),
      tx
    )

    return result
  }

  async validateBlock(
    id: string | null | undefined,
    value: string | null,
    type: 'parentBlockId' | 'journeyId' = 'parentBlockId'
  ): Promise<boolean> {
    const block =
      id != null
        ? await this.prismaService.block.findUnique({
            where: { id },
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

  @ToPostgresql()
  async update<T>(
    id: string,
    input: Prisma.BlockUpdateInput | Prisma.BlockUncheckedUpdateInput
  ): Promise<T> {
    if (input.action != null) {
      const data = {
        parentBlock: { connect: { id } },
        ...omit(input.action, 'id')
      }
      await this.prismaService.action.upsert({
        where: { parentBlockId: id },
        create: data,
        update: data
      })
    } else if (input.action === null) {
      await this.prismaService.action.delete({ where: { parentBlockId: id } })
    }
    return (await this.prismaService.block.update({
      where: { id },
      data: omit(input, [
        ...OMITTED_BLOCK_FIELDS,
        'action'
      ]) as Prisma.BlockUpdateInput,
      include: { action: true }
    })) as unknown as T
  }
}
