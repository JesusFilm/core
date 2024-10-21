import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { Block, Prisma } from '.prisma/api-journeys-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'

import {
  BlockDeleteResponse,
  BlockDuplicateIdMap,
  BlocksFilter
} from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { BlockService, BlockWithAction } from './block.service'

@Resolver('Block')
export class BlockResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @ResolveField()
  __resolveType(obj: { __typename?: string; typename: string }): string {
    return obj.__typename ?? obj.typename
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockOrderUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('parentOrder') parentOrder: number
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id, deletedAt: null },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.blockService.reorderBlock(block, parentOrder)
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockDuplicate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('parentOrder') parentOrder?: number,
    @Args('idMap') idMap?: BlockDuplicateIdMap[],
    @Args('x') x?: number,
    @Args('y') y?: number
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id, deletedAt: null },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })

    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.blockService.duplicateBlock(
      block,
      parentOrder,
      idMap,
      x,
      y
    )
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<BlockDeleteResponse> {
    const block = await this.prismaService.block.findUnique({
      where: { id, deletedAt: null },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })

    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to delete block', {
        extensions: { code: 'FORBIDDEN' }
      })

    const updatedBlocks = await this.nullifyReferencesTo(block)
    // Blocks aren't actually deleted, they are just marked as deleted
    const deletedBlocks = await this.blockService.removeBlockAndChildren(block)
    return { deletedBlocks, updatedBlocks }
  }

  // TODO(jk): move to service
  // Find all blocks that reference the block being deleted and drop references
  private async nullifyReferencesTo(block): Promise<Block[]> {
    const stepBlocksReferencingDeleted =
      await this.prismaService.block.findMany({
        where: { nextBlockId: block.id }
      })

    const actionBlocksReferencingDeleted =
      await this.prismaService.block.findMany({
        where: { action: { blockId: block.id } }
      })

    // // Actually delete the actions that navigate to the deleting block
    // await Promise.all(
    //   actionBlocksReferencingDeleted.map(async (referencingBlock) => {
    //     const results = await this.prismaService.action.delete({
    //       where: { parentBlockId: referencingBlock.id }
    //     })
    //     console.log('deleting action blocks ', results)
    //   })
    // )

    return await Promise.all([
      ...stepBlocksReferencingDeleted.map(async (referencingBlock) => {
        const results = await this.prismaService.block.update({
          where: { id: referencingBlock.id },
          data: { nextBlockId: null }
        })
        console.log(
          'updated ',
          results.id,
          ' nextBlockId to ',
          results.nextBlockId
        )
        return results
      }),
      ...actionBlocksReferencingDeleted.map(async (referencingBlock) => {
        const results = await this.prismaService.block.update({
          where: { id: referencingBlock.id },
          data: { action: undefined }
        })
        // NOTE: action record is still persisted in database
        console.log('nullifying action on block ', results)
        return results
      })
    ])
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockUpdate(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id, deletedAt: null },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })

    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to delete block', {
        extensions: { code: 'FORBIDDEN' }
      })

    const referencingBlocks = await this.nullifyReferencesTo(block)
    return referencingBlocks
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async block(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id, deletedAt: null },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })

    if (block == null) {
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (!ability.can(Action.Read, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to read block', {
        extensions: { code: 'FORBIDDEN' }
      })
    return block
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async blocks(
    @CaslAccessible('Block') accessibleBlocks: Prisma.BlockWhereInput,
    @Args('where') where?: BlocksFilter
  ): Promise<Block[]> {
    const filter: Prisma.BlockWhereInput = {
      deletedAt: null
    }

    if (where?.typenames != null) filter.typename = { in: where.typenames }
    if (where?.journeyIds != null) filter.journeyId = { in: where.journeyIds }

    const blocks = await this.prismaService.block.findMany({
      where: {
        AND: [accessibleBlocks, filter]
      },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })
    return blocks
  }

  private async restoreReferencesTo(block, sourceBlocks): Promise<Block[]> {
    const stepBlocksReferencingRestored = sourceBlocks.filter(
      (sourceBlock) => sourceBlock.__typename === 'StepBlock'
    )

    const actionBlocksReferencingRestored = sourceBlocks.filter(
      (sourceBlock) =>
        (sourceBlock.__typename === 'ButtonBlock' ||
          sourceBlock.__typename === 'RadioOptionBlock') &&
        sourceBlock?.action?.__typename === 'NavigateToBlockAction'
    )

    return await Promise.all([
      ...stepBlocksReferencingRestored.map(async (referencingBlock) => {
        const result = await this.prismaService.block.update({
          where: { id: referencingBlock.id },
          data: { nextBlockId: block.id }
        })
        return result
      }),

      ...actionBlocksReferencingRestored.map(async (referencingBlock) => {
        const result = await this.prismaService.block.update({
          where: { id: referencingBlock.id },
          data: {
            action: {
              update: { blockId: block.id }
            }
          }
        })
        return result
      })
    ])
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockRestore(
    @Args('id') id: string,
    // @Args('referencingBlocks') referencingBlocks: string[],
    @CaslAbility() ability: AppAbility
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        journey: {
          include: {
            team: { include: { userTeams: true } },
            userJourneys: true
          }
        }
      }
    })

    if (block == null) {
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })

    // TODO(jk): move to service

    return await this.prismaService.$transaction(async (tx) => {
      const updatedBlock = await tx.block.update({
        where: { id },
        data: {
          deletedAt: null
        },
        include: {
          action: true
        }
      })

      // // Restore references for the referencing blocks
      // await Promise.all(
      //   referencingBlocks.map(async (referencingBlockId) => {
      //     const referencingBlock = await this.prismaService.block.findUnique({
      //       where: { id: referencingBlockId },
      //       include: { action: true }
      //     })

      //     console.log('referencingBlock ', referencingBlock)

      //     if (referencingBlock?.nextBlockId == null) {
      //       const result = await this.prismaService.block.update({
      //         where: { id: referencingBlockId },
      //         data: { nextBlockId: updatedBlock.id }
      //       })
      //       console.log('updaing step reference ', result)
      //     }

      //     if (referencingBlock?.action == null) {
      //       const result = await tx.action.create({
      //         data: {
      //           blockId: updatedBlock.id,
      //           parentBlockId: referencingBlockId
      //         }
      //       })
      //       console.log('updaing action reference ', result)
      //     }
      //   })
      // )

      let siblings: BlockWithAction[] = [updatedBlock]
      if (updatedBlock?.parentOrder != null)
        siblings = await this.blockService.reorderBlock(
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

      const children: Block[] = await this.blockService.getDescendants(
        updatedBlock.id,
        blocks
      )

      return [...siblings, ...children]
    })
  }
}
