import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes, omit } from 'lodash'
import { GraphQLError } from 'graphql'
import { Journey, Action } from '.prisma/api-journeys-client'

import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  NavigateToJourneyAction,
  NavigateToJourneyActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @ResolveField()
  async journey(
    @Parent() action: NavigateToJourneyAction
  ): Promise<Journey | null> {
    return await this.prismaService.journey.findUnique({
      where: { id: action.journeyId }
    })
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockUpdateNavigateToJourneyAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateToJourneyActionInput
  ): Promise<Action> {
    const block = await this.prismaService.block.findUnique({
      where: { id },
      include: { action: true }
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

    const actionData = {
      ...omit(input, 'journeyId'),
      journey: { connect: { id: journeyId } },
      url: null,
      target: null
    }

    return await this.prismaService.action.upsert({
      where: { parentBlockId: id },
      create: {
        ...actionData,
        parentBlock: { connect: { id: block.id } }
      },
      update: {
        ...actionData,
        block: { disconnect: true }
      }
    })
  }
}
