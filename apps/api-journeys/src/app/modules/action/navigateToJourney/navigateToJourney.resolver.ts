import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'

import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  Block,
  Journey,
  NavigateToJourneyAction,
  NavigateToJourneyActionInput,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { JourneyService } from '../../journey/journey.service'
import { BlockService } from '../../block/block.service'

@Resolver('NavigateToJourneyAction')
export class NavigateToJourneyActionResolver {
  constructor(
    private readonly journeyService: JourneyService,
    private readonly blockService: BlockService
  ) {}

  @ResolveField()
  async journey(@Parent() action: NavigateToJourneyAction): Promise<Journey> {
    return await this.journeyService.get(action.journeyId)
  }

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [UserJourneyRole.owner, UserJourneyRole.editor])
  )
  async blockUpdateNavigateToJourneyAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateToJourneyActionInput
  ): Promise<Action> {
    const block = await this.blockService.get<
      Block & {
        __typename: string
      }
    >(id)

    if (
      !includes(
        ['SignUpBlock', 'RadioOptionBlock', 'ButtonBlock', 'VideoTriggerBlock'],
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
