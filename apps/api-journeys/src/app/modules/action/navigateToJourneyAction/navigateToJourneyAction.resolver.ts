import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { GraphQLError } from 'graphql'
import { Journey, Action } from '.prisma/api-journeys-client'
import includes from 'lodash/includes'
import omit from 'lodash/omit'
import { CaslAbility } from '@core/nest/common/CaslAuthModule'
import { subject } from '@casl/ability'
import { NavigateToJourneyActionInput } from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'
import { AppCaslGuard } from '../../../lib/casl/caslGuard'
import { Action as CaslAction, AppAbility } from '../../../lib/casl/caslFactory'
import { ACTION_UPDATE_RESET } from '../actionUpdateReset'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Mutation()
  @UseGuards(AppCaslGuard)
  async blockUpdateNavigateToJourneyAction(
    @CaslAbility() ability: AppAbility,
    @Args('id') id: string,
    @Args('input') input: NavigateToJourneyActionInput
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
    if (
      block == null ||
      !includes(
        [
          'SignUpBlock',
          'RadioOptionBlock',
          'ButtonBlock',
          'VideoBlock',
          'VideoTriggerBlock',
          'TextResponseBlock'
        ],
        block.typename
      )
    ) {
      throw new GraphQLError(
        'This block does not support navigate to journey actions',
        { extensions: { code: 'BAD_USER_INPUT' } }
      )
    }
    const inputWithJourneyConnection = {
      ...omit(input, 'journeyId'),
      journey: { connect: { id: input.journeyId } }
    }
    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...inputWithJourneyConnection,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...ACTION_UPDATE_RESET,
        ...inputWithJourneyConnection
      }
    })
  }

  @ResolveField()
  async journey(@Parent() action: Action): Promise<Journey | null> {
    if (action.journeyId == null) return null
    return await this.prismaService.journey.findUnique({
      where: { id: action.journeyId }
    })
  }
}
