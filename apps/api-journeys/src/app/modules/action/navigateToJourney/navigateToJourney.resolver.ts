import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'
import { Journey } from '.prisma/api-journeys-client'
import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  Block,
  NavigateToJourneyAction,
  NavigateToJourneyActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'
import { PrismaService } from '../../../lib/prisma.service'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(
    private readonly blockService: BlockService,
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
    const block = (await this.blockService.get(id)) as Block & {
      __typename: string
    }

    if (
      !includes(
        [
          'SignUpBlock',
          'RadioOptionBlock',
          'ButtonBlock',
          'VideoBlock',
          'VideoTriggerBlock',
          'TextResponseBlock'
        ],
        block.__typename
      )
    ) {
      throw new UserInputError(
        'This block does not support navigate to journey actions'
      )
    }
    const updatedBlock: { action: Action } = await this.blockService.update(
      id,
      {
        action: {
          ...input,
          parentBlockId: block.id,
          blockId: null,
          url: null,
          target: null
        }
      }
    )

    return updatedBlock.action
  }
}
