import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { Block, Prisma } from '.prisma/api-journeys-client'
import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'

import { BlockDuplicateIdMap, BlocksFilter } from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'
import { INCLUDE_JOURNEY_ACL } from '../journey/journey.acl'

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
        ...INCLUDE_JOURNEY_ACL
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

    return await this.prismaService.$transaction(async (tx) => {
      const reorderedBlocks = await this.blockService.reorderBlock(
        block,
        parentOrder
      )
      await tx.journey.update({
        where: {
          id: block.journeyId
        },
        data: { updatedAt: new Date().toISOString() }
      })
      return reorderedBlocks
    })
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
        ...INCLUDE_JOURNEY_ACL
      }
    })
    const isStepBlock = block?.typename === 'StepBlock'

    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })

    return await this.prismaService.$transaction(async (tx) => {
      const duplicatedBlocks = await this.blockService.duplicateBlock(
        block,
        isStepBlock,
        parentOrder,
        idMap,
        x,
        y
      )
      await tx.journey.update({
        where: {
          id: block.journeyId
        },
        data: { updatedAt: new Date().toISOString() }
      })
      return duplicatedBlocks
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id, deletedAt: null },
      include: {
        action: true,
        ...INCLUDE_JOURNEY_ACL
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
    return await this.blockService.removeBlockAndChildren(block)
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
        ...INCLUDE_JOURNEY_ACL
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
        ...INCLUDE_JOURNEY_ACL
      }
    })
    return blocks
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockRestore(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<Block[]> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        ...INCLUDE_JOURNEY_ACL
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

      await tx.journey.update({
        where: {
          id: updatedBlock.journeyId
        },
        data: { updatedAt: new Date().toISOString() }
      })
      return [...siblings, ...children]
    })
  }
}
