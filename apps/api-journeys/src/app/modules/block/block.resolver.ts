import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { Block, Prisma } from '.prisma/api-journeys-client'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'

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
    @Args('parentOrder') parentOrder?: number
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
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    return await this.blockService.duplicateBlock(block, parentOrder)
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockDelete(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
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
    if (!ability.can(Action.Read, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to read block', {
        extensions: { code: 'FORBIDDEN' }
      })
    return block
  }

  @Query()
  @UseGuards(AppCaslGuard)
  async blocks(
    @CaslAbility() ability: AppAbility,
    @Args('journeyId') journeyId: string,
    @Args('where') where?: BlocksFilter
  ): Promise<Block[]> {
    const journey = await this.prismaService.journey.findUnique({
      where: { id: journeyId },
      include: {
        userJourneys: true,
        team: {
          include: { userTeams: true }
        }
      }
    })
    if (journey == null)
      throw new GraphQLError('journey not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(Action.Read, subject('Journey', journey)))
      throw new GraphQLError('user is not allowed to view journey', {
        extensions: { code: 'FORBIDDEN' }
      })
    const filter: Prisma.BlockWhereInput = { journeyId }

    if (where?.typename != null) {
      filter.typename = { in: where.typename }
    }

    const blocks = await this.prismaService.block.findMany({
      where: filter,
      include: { action: true }
    })
    return blocks
  }
}
