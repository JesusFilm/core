import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { includes } from 'lodash'
import { UserInputError } from 'apollo-server-errors'

import { RoleGuard } from '../../../lib/roleGuard/roleGuard'
import {
  Action,
  Block,
  NavigateToBlockActionInput,
  Role,
  UserJourneyRole
} from '../../../__generated__/graphql'
import { BlockService } from '../../block/block.service'

@Resolver('NavigateToBlockAction')
export class NavigateToBlockActionResolver {
  constructor(private readonly blockService: BlockService) {}

  @Mutation()
  @UseGuards(
    RoleGuard('journeyId', [
      UserJourneyRole.owner,
      UserJourneyRole.editor,
      { role: Role.publisher, attributes: { template: true } }
    ])
  )
  async blockUpdateNavigateToBlockAction(
    @Args('id') id: string,
    @Args('journeyId') journeyId: string,
    @Args('input') input: NavigateToBlockActionInput
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
        'This block does not support navigate to block actions'
      )
    }

    const updatedBlock: { action: Action } = await this.blockService.update(
      id,
      {
        action: {
          ...input,
          parentBlockId: block.id,
          journeyId: null,
          url: null,
          target: null
        }
      }
    )

    return updatedBlock.action
  }
}
