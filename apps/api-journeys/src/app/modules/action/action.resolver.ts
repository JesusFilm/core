import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import get from 'lodash/get'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { FromPostgresql } from '@core/nest/decorators/FromPostgresql'
import { Action, Block } from '.prisma/api-journeys-client'

import { AppAbility, Action as CaslAction } from '../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { canBlockHaveAction } from './canBlockHaveAction'

@Resolver('Action')
export class ActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField()
  __resolveType(obj: Action): string {
    if (get(obj, 'blockId') != null) return 'NavigateToBlockAction'
    if (get(obj, 'email') != null) return 'EmailAction'
    return 'LinkAction'
  }

  @ResolveField('parentBlock')
  async parentBlock(
    @Parent() action: Action & { parentBlock?: Block }
  ): Promise<Block | null> {
    if (action.parentBlock != null) return action.parentBlock

    return await this.prismaService.block.findUnique({
      where: { id: action.parentBlockId }
    })
  }

  @Mutation()
  @UseGuards(AppCaslGuard)
  @FromPostgresql()
  async blockDeleteAction(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string
  ): Promise<Block> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: {
        action: true,
        journey: {
          include: {
            userJourneys: true,
            team: {
              include: { userTeams: true }
            }
          }
        }
      }
    })
    if (block == null)
      throw new GraphQLError('block not found', {
        extensions: { code: 'NOT_FOUND' }
      })
    if (!ability.can(CaslAction.Update, subject('Journey', block.journey)))
      throw new GraphQLError('user is not allowed to update block', {
        extensions: { code: 'FORBIDDEN' }
      })
    if (block == null || !canBlockHaveAction(block)) {
      throw new GraphQLError('This block does not support actions', {
        extensions: { code: 'BAD_USER_INPUT' }
      })
    }

    await this.prismaService.action.delete({ where: { parentBlockId: id } })
    return block
  }
}
