import { subject } from '@casl/ability'
import { UseGuards } from '@nestjs/common'
import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { Action } from '.prisma/api-journeys-client'

import { NavigateToBlockActionInput } from '../../../__generated__/graphql'
import { AppAbility, Action as CaslAction } from '../../../lib/casl/caslFactory'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { PrismaService } from '../../../lib/prisma.service'
import { ActionService } from '../action.service'
import { canBlockHaveAction } from '../canBlockHaveAction'

@Resolver('NavigateToBlockAction')
export class NavigateToBlockActionResolver {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly actionService: ActionService
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

    return await this.actionService.navigateToBlockActionUpdate(
      id,
      block,
      input
    )
  }
}
