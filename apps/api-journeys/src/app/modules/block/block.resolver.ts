import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility, CaslAccessible } from '@core/nest/common/CaslAuthModule'
import { Block, Prisma } from '.prisma/api-journeys-client'

import { BlocksFilter } from '../../__generated__/graphql'
import { Action, AppAbility } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { BlockService } from './block.service'

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
    return await this.blockService.duplicateBlock(block, parentOrder, x, y)
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

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockRestore(
    @Args('id') id: string,
    @CaslAbility() ability: AppAbility
  ): Promise<Block> {
    const block = await this.prismaService.block.update({
      where: { id },
      data: {
        deletedAt: null
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

    if (block == null) {
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    }
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })

    if (block.parentOrder != null)
      await this.blockService.reorderBlock(block, block.parentOrder)

    return block
  }
}
