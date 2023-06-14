import { Injectable } from '@nestjs/common'
import { v4 as uuidv4 } from 'uuid'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { ToPostgresql } from '@core/nest/decorators/ToPostgresql'
import { Journey, Block, Prisma, Action } from '.prisma/api-journeys-client'
import { omit } from 'lodash'

import { PrismaService } from '../../lib/prisma.service'

type BlockWithAction = Block & { action: Action }
@Injectable()
export class BlockService {
  constructor(private readonly prismaService: PrismaService) {}

  @FromPostgresql()
  async getBlocksByType(journey: Journey, typename: string): Promise<Block[]> {
    return await this.prismaService.block.findMany({
      where: { journeyId: journey.id, typename },
      orderBy: { parentOrder: 'asc' },
      include: { action: true }
    })
  }

  @FromPostgresql()
  async getSiblings(
    journeyId: string,
    parentBlockId?: string | null
  ): Promise<Block[]> {
    return await this.getSiblingsInternal(journeyId, parentBlockId)
  }

  async getSiblingsInternal(
    journeyId: string,
    parentBlockId?: string | null
  ): Promise<Block[]> {
    // Only StepBlocks should not have parentBlockId
    return parentBlockId != null
      ? await this.prismaService.block.findMany({
          where: {
            journeyId,
            parentBlockId,
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' },
          include: { action: true }
        })
      : await this.prismaService.block.findMany({
          where: {
            journeyId,
            typename: 'StepBlock',
            parentOrder: { not: null }
          },
          orderBy: { parentOrder: 'asc' },
          include: { action: true }
        })
  }

  async reorderSiblings(siblings: Block[]): Promise<Block[]> {
    const updatedSiblings = siblings.map((block, index) => ({
      ...block,
      parentOrder: index
    }))
    return await Promise.all(
      updatedSiblings.map(
        async (block) =>
          await this.prismaService.block.update({
            where: { id: block.id },
            data: { parentOrder: block.parentOrder }
          })
      )
    )
  }

  @FromPostgresql()
  async reorderBlock(
    id: string,
    journeyId: string,
    parentOrder: number
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { action: true }
    })

    if (block?.journeyId === journeyId && block.parentOrder != null) {
      const siblings = await this.getSiblingsInternal(
        journeyId,
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
    id: string,
    journeyId: string,
    parentOrder?: number
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { action: true }
    })

    if (block?.journeyId === journeyId) {
      const blockAndChildrenData = await this.getDuplicateBlockAndChildren(
        id,
        journeyId,
        block.parentBlockId ?? null
      )
      const duplicateBlockAndChildren = await Promise.all(
        blockAndChildrenData.map(
          async (newBlock) =>
            await this.prismaService.block.create({
              data: {
                ...omit(newBlock, 'action'),
                action:
                  newBlock.action != null
                    ? { create: newBlock.action }
                    : undefined
              }
            })
        )
      )
      const duplicatedBlock = duplicateBlockAndChildren[0]
      const duplicatedChildren = duplicateBlockAndChildren.slice(1)

      // Newly duplicated block returns with original block and siblings.
      const siblings = await this.getSiblingsInternal(
        journeyId,
        block.parentBlockId
      )
      const defaultDuplicateBlockIndex = siblings.findIndex(
        (block) => block.id === duplicatedBlock.id
      )
      const insertIndex =
        parentOrder != null ? parentOrder : siblings.length + 1
      siblings.splice(defaultDuplicateBlockIndex, 1)
      siblings.splice(insertIndex, 0, duplicatedBlock)
      const reorderedBlocks: Block[] = await this.reorderSiblings(siblings)

      return reorderedBlocks.concat(duplicatedChildren)
    }
    return []
  }

  async getDuplicateChildren(
    children: Block[],
    journeyId: string,
    parentBlockId: string | null,
    // Use to custom set children blockIds
    duplicateIds: Map<string, string>,
    // Below 2 only used when duplicating journeys
    duplicateJourneyId?: string,
    duplicateStepIds?: Map<string, string>
  ): Promise<Block[]> {
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
    return duplicateChildren.reduce<Block[]>((acc, val) => {
      return acc.concat(val)
    }, [])
  }

  @FromPostgresql()
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

    const children = await this.getBlocksForParentId(block.id, journeyId)
    const childIds = new Map()
    children.forEach((block) => {
      childIds.set(block.id, uuidv4())
    })
    const updatedBlockProps: Prisma.BlockUpdateInput = {}
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
        const action = omit(block[key], 'id')
        updatedBlockProps[key] = {
          create:
            action?.blockId != null && duplicateStepIds != null
              ? {
                  ...action,
                  blockId:
                    duplicateStepIds.get(action.blockId) ?? action.blockId
                }
              : action
        }
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

    return [
      duplicateBlock as BlockWithAction,
      ...(duplicateChildren as BlockWithAction[])
    ]
  }

  @FromPostgresql()
  async getBlocksForParentId(
    parentId: string,
    journeyId: string
  ): Promise<Block[]> {
    return await this.prismaService.block.findMany({
      where: { parentBlockId: parentId, journeyId },
      include: { action: true },
      orderBy: { parentOrder: 'asc' }
    })
  }

  protected async removeAllBlocksForParentId(
    parentIds: string[],
    blockArray: Block[] = []
  ): Promise<Block[]> {
    if (parentIds.length === 0) {
      return blockArray
    }
    const blocks = await this.prismaService.block.findMany({
      where: { parentBlockId: { in: parentIds } },
      include: { action: true }
    })
    const blockIds = blocks.map((block) => block.id)

    const result = await this.removeAllBlocksForParentId(blockIds, [
      ...blockArray,
      ...blocks
    ])
    await this.prismaService.action.deleteMany({
      where: { id: { in: blockIds } }
    })
    await this.prismaService.block.deleteMany({
      where: { id: { in: blockIds } }
    })
    return result
  }

  @FromPostgresql()
  async removeBlockAndChildren(
    blockId: string,
    journeyId: string,
    parentBlockId?: string
  ): Promise<Block[]> {
    await this.prismaService.action.delete({
      where: { id: blockId }
    })
    const res: Block = await this.prismaService.block.delete({
      where: { id: blockId }
    })
    await this.removeAllBlocksForParentId([blockId], [res])
    const result = await this.reorderSiblings(
      await this.getSiblingsInternal(journeyId, parentBlockId)
    )

    return result as unknown as Block[]
  }

  async validateBlock(
    id: string | null | undefined,
    value: string | null,
    type: 'parentBlockId' | 'journeyId' = 'parentBlockId'
  ): Promise<boolean> {
    const block: Block | null =
      id != null
        ? await this.prismaService.block.findUnique({
            where: { id },
            include: { action: true }
          })
        : null

    return block != null ? block[type] === value : false
  }

  @FromPostgresql()
  async save<T>(input: Prisma.BlockCreateInput): Promise<T> {
    return (await this.prismaService.block.create({
      data: input
    })) as unknown as T
  }

  @FromPostgresql()
  async saveAll<T>(inputs: Prisma.BlockCreateInput[]): Promise<T[]> {
    return await Promise.all(
      inputs.map(
        async (input) =>
          (await this.prismaService.block.create({
            data: input
          })) as unknown as T
      )
    )
  }

  @ToPostgresql()
  async update<T>(id: string, input: Prisma.BlockUpdateInput): Promise<T> {
    return (await this.prismaService.block.update({
      where: { id },
      data: input
    })) as unknown as T
  }
}
