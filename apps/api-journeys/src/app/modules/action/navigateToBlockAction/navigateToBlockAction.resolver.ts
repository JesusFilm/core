import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import omit from 'lodash/omit'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Action } from '.prisma/api-journeys-client'

import { NavigateToBlockActionInput } from '../../../__generated__/graphql'
import { AppAbility, Action as CaslAction } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { BlockService } from '../../block/block.service'
import { ACTION_UPDATE_RESET } from '../actionUpdateReset'
import { canBlockHaveAction } from '../canBlockHaveAction'

@Resolver('NavigateToBlockAction')
export class NavigateToBlockActionResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly prismaService: PrismaService
  ) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockUpdateNavigateToBlockAction(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: NavigateToBlockActionInput
  ): Promise<Action> {
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
      throw new GraphQLError(
        'This block does not support navigate to block actions',
        { extensions: { code: 'BAD_USER_INPUT' } }
      )
    }

    const stepBlock = await this.blockService.findParentStepBlock(
      block.parentBlockId as string
    )
    if (stepBlock != null && stepBlock.id === input.blockId)
      throw new GraphQLError('blockId cannot be the parent step block id', {
        extensions: { code: 'BAD_USER_INPUT' }
      })

    const inputWithBlockConnection = {
      ...omit(input, 'blockId'),
      block: { connect: { id: input.blockId } }
    }
    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...inputWithBlockConnection,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...ACTION_UPDATE_RESET,
        ...inputWithBlockConnection
      }
    })
  }
}
