import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Journey } from '.prisma/api-journeys-client'

import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  NavigateToJourneyAction,
  NavigateToJourneyActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(
    private readonly prismaService: PrismaService
  ) {}

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
    const block = (await this.prismaService.block.findUnique({ where: { id } }))

    if (block == null ||
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
      throw new UserInputError(
        'This block does not support navigate to journey actions'
      )
    }
    return await this.prismaService.action.update(
      { where: { id },
      data:{
          ...input,
          parentBlockId: block.id,
          blockId: null,
          url: null,
          target: null
        }
      }
    )
  }
}
